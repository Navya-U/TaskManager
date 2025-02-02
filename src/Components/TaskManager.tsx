import React, { FC, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

import TaskCreationModal from './TaskCreationModal';
import {
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import TaskListView from './TaskListView';
import TaskBoardView from './TaskBoardView';

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

const TaskManager: FC<{ userId: string; viewMode: string }> = ({
  userId,
  viewMode,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'work' | 'personal'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownCOpen, setDropdownCOpen] = useState(false);
  const [dropdownDOpen, setDropdownDOpen] = useState(false);

  const toggleCDropdown = () => setDropdownCOpen((prev) => !prev);
  const toggleDDropdown = () => setDropdownDOpen((prev) => !prev);

  const toggleModal = () => setModalOpen(!modalOpen);

  const fetchTasks = async () => {
    const tasksCollection = query(collection(db, 'tasks'), orderBy('position'));
    const taskSnapshot = await getDocs(tasksCollection);
    const taskList = taskSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];

    setTasks(taskList.filter((task) => task.userId === userId));
  };

  useEffect(() => {
    fetchTasks();
  });

  const handleSortByDate = async (order: 'asc' | 'desc') => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    sortedTasks.forEach(async (task, index) => {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { position: index });
    });
    setTasks(sortedTasks);
  };

  return (
    <>
      <div
        className="container"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex' }}>
          <Dropdown isOpen={dropdownCOpen} toggle={toggleCDropdown}>
            <DropdownToggle caret size="sm">
              Category
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setFilterCategory('all')}>
                All
              </DropdownItem>
              <DropdownItem onClick={() => setFilterCategory('work')}>
                Work
              </DropdownItem>
              <DropdownItem onClick={() => setFilterCategory('personal')}>
                Personal
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          &nbsp; &nbsp;
          <Dropdown isOpen={dropdownDOpen} toggle={toggleDDropdown}>
            <DropdownToggle caret size="sm">
              Due Date
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleSortByDate('asc')}>
                Sort by Due Date (Asc)
              </DropdownItem>
              <DropdownItem onClick={() => handleSortByDate('desc')}>
                Sort by Due Date (Desc)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            style={{
              marginBottom: '10px',
              padding: '5px',
              width: '100%',
              borderRadius: '48px',
            }}
          />
        </div>

        <div>
          <Button
            color="primary"
            onClick={toggleModal}
            style={{ borderRadius: '48px' }}
          >
            Add Task
          </Button>

          <TaskCreationModal
            isOpen={modalOpen}
            toggle={toggleModal}
            userId={userId}
            onTaskAdded={fetchTasks}
            taskId={undefined}
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <TaskListView
          userId={userId}
          filterCategory={filterCategory}
          searchQuery={searchQuery}
        />
      ) : (
        <TaskBoardView
          userId={userId}
          filterCategory={filterCategory}
          searchQuery={searchQuery}
        />
      )}
    </>
  );
};
export default TaskManager;
