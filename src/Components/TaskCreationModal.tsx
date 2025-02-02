import React, { FC, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
} from 'reactstrap';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import ActivityLog from './ActivityLog';

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
  description: string;
  activityLog: ActivityLogEntry[];
}

interface TaskCreateModalProps {
  isOpen: boolean;
  toggle: () => void;
  userId: string;
  onTaskAdded: () => void;
  taskId?: string;
}
const TaskCreationModal: FC<TaskCreateModalProps> = ({
  isOpen,
  toggle,
  userId,
  onTaskAdded,
  taskId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');

  const handleAddTask = async () => {
    if (!taskText.trim() || !dueDate) return;
    try {
      const todoTasksCount = tasks.filter(
        (task) => task.status === 'todo'
      ).length;

      await addDoc(collection(db, 'tasks'), {
        userId,
        text: taskText,
        completed: false,
        category: category,
        dueDate: dueDate,
        order: tasks.length + 1,
        description: description,
        position: todoTasksCount,
        status: status,
        activityLog: [
          { timestamp: new Date().toISOString(), action: 'Task Created' },
        ],
      });

      setTaskText('');
      setCategory('work');
      setDueDate('');
      setStatus('');
      onTaskAdded();
      toggle();
    } catch (err) {
      console.error('Error adding task: ', err);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Add Task</ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label for="taskText">Task</Label>
          <Input
            type="text"
            id="tasktext"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Enter Task Name"
          />
        </FormGroup>

        <FormGroup>
          <Label for="taskDesc">Description</Label>
          <Input
            type="text"
            id="taskdesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
          />
        </FormGroup>

        <FormGroup>
          <Label for="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>
        </FormGroup>

        <FormGroup>
          <Label for="category">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="inprogress"> In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </FormGroup>

        <FormGroup>
          <Label for="dueDate">Due Date</Label>
          <Input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormGroup>

        {taskId && (
          <FormGroup>
            <Label>Activity Log</Label>
            <ActivityLog taskId={taskId} />
          </FormGroup>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleAddTask}>
          Create
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TaskCreationModal;
