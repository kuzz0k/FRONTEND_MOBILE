import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simple in-memory ring buffer
const MAX_LOGS = 300;
let buffer: { ts: number; level: string; text: string }[] = [];
let listeners: (() => void)[] = [];

function emit() { listeners.forEach(l => l()); }

// Patch console once (idempotent)
declare global { // eslint-disable-next-line no-var
  var __LOG_OVERLAY_PATCHED__: boolean | undefined; // allow global flag
}

if (!global.__LOG_OVERLAY_PATCHED__) {
  global.__LOG_OVERLAY_PATCHED__ = true;
  const raw = { ...console } as any;
  ['log','info','warn','error'].forEach(level => {
    const orig = raw[level] || (() => {});
    console[level as 'log'] = (...args: any[]) => {
      try {
        const text = args.map(a => typeof a === 'string' ? a : JSON.stringify(a, replacerSafe, 2)).join(' ');
        buffer.push({ ts: Date.now(), level, text });
        if (buffer.length > MAX_LOGS) buffer = buffer.slice(buffer.length - MAX_LOGS);
        emit();
      } catch {}
      orig(...args);
    };
  });
}

function replacerSafe(_k: string, v: any) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return '[fn]';
  return v;
}

export const LogOverlay: React.FC<{ initialOpen?: boolean }>= ({ initialOpen=false }) => {
  const [open, setOpen] = useState(initialOpen);
  const [, force] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const l = () => force(x => x+1);
    listeners.push(l);
    return () => { listeners = listeners.filter(f => f!==l); };
  }, []);

  useEffect(() => {
    if (open) setTimeout(()=> scrollRef.current?.scrollToEnd({ animated: true }), 10);
  }, [open]);

  if (!__DEV__) return null; // Only show in dev

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.toggle, open && styles.toggleOn]}
        onPress={() => setOpen(o=>!o)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>{open ? 'LOGS▼' : 'LOGS▲'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Console ({buffer.length})</Text>
            <TouchableOpacity onPress={() => { buffer = []; emit(); }}><Text style={styles.clear}>CLR</Text></TouchableOpacity>
          </View>
          <ScrollView ref={scrollRef} style={styles.scroll}>
            {buffer.map((l,i) => (
              <Text key={i} style={[styles.line, levelStyle(l.level)]}>
                {new Date(l.ts).toLocaleTimeString()} {l.level.toUpperCase()} {l.text}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

function levelStyle(level: string) {
  switch(level){
    case 'error': return { color: '#ff5252' };
    case 'warn': return { color: '#ffb300' };
    case 'info': return { color: '#64b5f6' };
    default: return { color: '#e0e0e0' };
  }
}

const styles = StyleSheet.create({
  wrapper: { position:'absolute', top: Platform.OS === 'android' ? 130 : 130, left:0, right:0, zIndex:9999, elevation:9999 },
  toggle: { alignSelf:'flex-end', backgroundColor:'rgba(0,0,0,0.6)', paddingHorizontal:18, paddingVertical:10, borderBottomLeftRadius:12, borderBottomRightRadius:0, elevation:9999 },
  toggleOn: { backgroundColor:'rgba(0,0,0,0.85)' },
  toggleText: { fontSize:15, color:'#fff', fontWeight:'700', letterSpacing:0.5 },
  panel: { maxHeight:'50%', backgroundColor:'rgba(0,0,0,0.85)', borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:6 },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  header: { color:'#fff', fontSize:12, fontWeight:'700' },
  clear: { color:'#f44336', fontSize:12, fontWeight:'600' },
  scroll: { },
  line: { fontSize:10, marginBottom:2, fontFamily: Platform.select({ ios:'Courier', android:'monospace' }) },
});

export default LogOverlay;