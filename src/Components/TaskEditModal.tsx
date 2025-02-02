import React, { FC, useState, useEffect } from 'react';
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
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import ActivityLog from './ActivityLog';

interface TaskEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  taskId: string;
  onTaskEdited: () => void;
}

const TaskEditModal: FC<TaskEditModalProps> = ({
  isOpen,
  toggle,
  taskId,
  onTaskEdited,
}) => {
  const [editedText, setEditedText] = useState('');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        setEditedText(taskData.text || '');
        setCategory(taskData.category || 'work');
        setDueDate(taskData.dueDate || '');
        setDescription(taskData.description || '');
        setStatus(taskData.status || 'todo');
      }
    };

    fetchTask();
  }, [taskId, isOpen]);

  const handleSaveEdit = async (taskId: string) => {
    if (!editedText.trim()) return;
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      text: editedText,
      category,
      dueDate,
      description,
      status,
    });

    await logTaskActivity(taskId, 'Task Edited');
    onTaskEdited();
    toggle();
  };

  const logTaskActivity = async (taskId: string, action: string) => {
    const taskRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskRef, {
        activityLog: arrayUnion({
          timestamp: new Date().toISOString(),
          action,
        }),
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Task</ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label for="taskText">Task</Label>
          <Input
            type="text"
            id="taskText"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Enter Task Name"
          />
        </FormGroup>

        <FormGroup>
          <Label for="taskDesc">Description</Label>
          <Input
            type="text"
            id="taskDesc"
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
          <Label for="dueDate">Due Date</Label>
          <Input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
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

        {taskId && (
          <FormGroup>
            <Label>Activity Log</Label>
            <ActivityLog taskId={taskId} />
          </FormGroup>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={() => handleSaveEdit(taskId)}>
          Update
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TaskEditModal;
