import React from 'react';
import { useSelector } from 'react-redux';
import { selectPointTasks } from '../../../store/reducers/tasksSlice';
import { TASK_DOT } from '../../../types/types';
import TaskMarker from './TaskMarker';

interface TasksLayerProps {
  onTaskPress?: (task: TASK_DOT) => void;
}

const TasksLayer: React.FC<TasksLayerProps> = ({ onTaskPress }) => {
  const pointTasks = useSelector(selectPointTasks);

  return (
    <>
      {pointTasks.map((task) => (
        <TaskMarker
          key={task.id}
          task={task}
          onPress={onTaskPress}
        />
      ))}
    </>
  );
};

export default TasksLayer;
