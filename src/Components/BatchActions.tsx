import React, { FC } from 'react';
import { db } from '../firebase';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface ActivityLogEntry {
  timestamp: string;
  action: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  userId: string;
  category: 'work' | 'personal';
  dueDate: string;
  status: 'todo' | 'inprogress' | 'completed';
  position: number;
  activityLog: ActivityLogEntry[];
}

interface BatchActionsProps {
  tasks: Task[];
  fetchTasks: () => void;
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
}

const BatchActions: FC<BatchActionsProps> = ({
  tasks,
  fetchTasks,
  setSelectedTasks,
}) => {
  const handleBatchDelete = async () => {
    if (!tasks.length) return alert('No tasks selected!');

    try {
      await Promise.all(
        tasks.map((task) => deleteDoc(doc(db, 'tasks', task.id)))
      );
      fetchTasks();
      setSelectedTasks([]);
    } catch (err) {
      console.error('Error deleting tasks:', err);
    }
  };

  const handleBatchComplete = async () => {
    if (!tasks.length) return alert('No tasks selected!');

    try {
      await Promise.all(
        tasks.map((task) =>
          updateDoc(doc(db, 'tasks', task.id), {
            status: 'completed',
            activityLog: [
              {
                timestamp: new Date().toISOString(),
                action: 'You Mark it as Completed ',
              },
            ],
          })
        )
      );

      fetchTasks();
      setSelectedTasks([]);
    } catch (err) {
      console.error('Error updating tasks:', err);
    }
  };

  return (
    <div>
      <button onClick={handleBatchComplete} disabled={!tasks.length}>
        <span role="img" aria-label="green_right">
          ✅
        </span>
        Mark as Complete
      </button>
      <button onClick={handleBatchDelete} disabled={!tasks.length}>
        <span role="img" aria-label="bin">
          🗑️
        </span>
        Delete Selected
      </button>
    </div>
  );
};

export default BatchActions;
