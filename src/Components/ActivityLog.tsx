import React, { FC, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ActivityLogEntry {
  timestamp: string;
  action: string;
}

const ActivityLog: FC<{ taskId: string }> = ({ taskId }) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  const fetchTaskActivity = async (taskId: string) => {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
      return taskSnap.data().activityLog || [];
    }
    return [];
  };

  useEffect(() => {
    const getLogs = async () => {
      const activityLogs = await fetchTaskActivity(taskId);
      setLogs(activityLogs);
    };
    getLogs();
  }, [taskId]);

  return (
    <div>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <span role="img" aria-label="pin">
              📌
            </span>
            {log.action} - at {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
