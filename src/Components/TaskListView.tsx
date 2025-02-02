import React, { FC, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Button,
  Card,
  CardHeader,
  CardText,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
} from 'reactstrap';
import TaskEditModal from './TaskEditModal';
import BatchActions from './BatchActions';

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

const TaskListView: FC<{
  userId: string;
  filterCategory: string;
  searchQuery: string;
}> = ({ userId, filterCategory, searchQuery }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const fetchTasks = async () => {
    const tasksCollection = query(collection(db, 'tasks'), orderBy('position'));
    const taskSnapshot = await getDocs(tasksCollection);
    const taskList = taskSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];

    setTasks(taskList.filter((task) => task.userId === userId));
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

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceSection = source.droppableId;
    const destSection = destination.droppableId;
    const draggedTaskIndex = tasks.findIndex((task) => task.id === draggableId);
    if (draggedTaskIndex === -1) return;
    const movedTask = { ...tasks[draggedTaskIndex] };

    let updatedTasks = [...tasks];

    updatedTasks.splice(draggedTaskIndex, 1);

    if (sourceSection !== destSection) {
      movedTask.status = destSection as 'todo' | 'inprogress' | 'completed';
    }

    const destTasks = updatedTasks.filter(
      (task) => task.status === destSection
    );

    destTasks.splice(destination.index, 0, movedTask);

    destTasks.forEach((task, index) => {
      task.position = index;
    });

    if (sourceSection !== destSection) {
      const sourceTasks = updatedTasks.filter(
        (task) => task.status === sourceSection
      );
      sourceTasks.forEach((task, index) => {
        task.position = index;
      });

      updatedTasks = updatedTasks.filter(
        (task) => task.status !== destSection && task.status !== sourceSection
      );
      updatedTasks = [...updatedTasks, ...sourceTasks, ...destTasks];
    } else {
      updatedTasks = updatedTasks.map((task) =>
        task.status === sourceSection
          ? destTasks.find((t) => t.id === task.id) || task
          : task
      );

      if (!updatedTasks.some((task) => task.id === movedTask.id)) {
        updatedTasks.push(movedTask);
      }
    }

    updatedTasks.sort((a, b) => {
      if (a.status === b.status) return a.position - b.position;
      return a.status.localeCompare(b.status);
    });

    setTasks(updatedTasks);

    const batch = writeBatch(db);
    updatedTasks.forEach((task) => {
      const taskRef = doc(db, 'tasks', task.id);
      batch.update(taskRef, { position: task.position, status: task.status });
    });
    await batch.commit();

    await logTaskActivity(
      movedTask.id,
      `You changed status from ${sourceSection} to ${destSection}`
    );
  };

  useEffect(() => {
    fetchTasks();
  });

  const handleDeleteTask = async (id: string) => {
    try {
      await logTaskActivity(id, 'Task Deleted');
      await deleteDoc(doc(db, 'tasks', id));
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task: ', err);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditModalOpen(true);
  };

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
    if (!editModalOpen) setEditingTaskId('');
  };

  const toggleSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const renderDraggableTask = (task: any, index: any) => (
    <ListGroup flush>
      <ListGroupItem>
        <Draggable key={task.id} draggableId={task.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '5px',
                ...provided.draggableProps.style,
              }}
            >
              <>
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleSelection(task.id)}
                  style={{ marginRight: '10px' }}
                />
                <CardText
                  style={{
                    textDecoration:
                      task.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {task.text}
                </CardText>
                <CardText>{task.dueDate}</CardText>
                <CardText>{task.status}</CardText>
                <CardText>{task.category}</CardText>

                <div>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleEditClick(task)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button
                    className="ml-5"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            </div>
          )}
        </Draggable>
      </ListGroupItem>
    </ListGroup>
  );

  return (
    <div>
      {selectedTasks.length > 0 && (
        <BatchActions
          tasks={tasks.filter((task) => selectedTasks.includes(task.id))}
          fetchTasks={fetchTasks}
          setSelectedTasks={setSelectedTasks}
        />
      )}
      <Row
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          marginBottom: '8px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '5px',
          marginRight: '10px',
          marginLeft: '10px',
        }}
      >
        <Col className="fw-bold">Task Name</Col>
        <Col className="fw-bold">Due On</Col>
        <Col className="fw-bold">Task Status</Col>
        <Col className="fw-bold">Task Category</Col>
      </Row>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <Col>
            <Row>
              <Card
                className="mb-3"
                style={{
                  width: '96%',
                  marginLeft: '2%',
                }}
              >
                <Droppable droppableId="todo" type="task">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <CardHeader
                        style={{
                          backgroundColor: '#FAC3FF',
                          width: '102%',
                          marginLeft: '-1%',
                        }}
                      >
                        <p className="text-sm-start fw-bolder">Todo</p>
                      </CardHeader>
                      {tasks.filter(
                        (task) =>
                          (filterCategory === 'all' ||
                            task.category === filterCategory) &&
                          task.status === 'todo' &&
                          task.text
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center">No Tasks in To-Do</div>
                      )}

                      {tasks
                        .filter(
                          (task) =>
                            (filterCategory === 'all' ||
                              task.category === filterCategory) &&
                            task.status === 'todo' &&
                            task.text
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((task, index) => renderDraggableTask(task, index))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Row>

            <Row>
              <Card
                className="mb-3"
                style={{
                  width: '96%',
                  marginLeft: '2%',
                }}
              >
                <Droppable droppableId="inprogress" type="task">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <CardHeader
                        style={{
                          backgroundColor: '#67daf1',
                          width: '102%',
                          marginLeft: '-1%',
                        }}
                      >
                        <p className="text-sm-start fw-bolder">In Progress</p>
                      </CardHeader>

                      {tasks.filter(
                        (task) =>
                          (filterCategory === 'all' ||
                            task.category === filterCategory) &&
                          task.status === 'inprogress' &&
                          task.text
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center">
                          No Tasks in In Progress
                        </div>
                      )}

                      {tasks
                        .filter(
                          (task) =>
                            (filterCategory === 'all' ||
                              task.category === filterCategory) &&
                            task.status === 'inprogress' &&
                            task.text
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((task, index) => renderDraggableTask(task, index))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Row>

            <Row>
              <Card
                style={{
                  width: '96%',
                  marginLeft: '2%',
                }}
              >
                <Droppable droppableId="completed" type="task">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <CardHeader
                        style={{
                          backgroundColor: '#68e1a9',
                          width: '102%',
                          marginLeft: '-1%',
                        }}
                      >
                        <p className="text-sm-start fw-bolder">Completed</p>
                      </CardHeader>

                      {tasks.filter(
                        (task) =>
                          (filterCategory === 'all' ||
                            task.category === filterCategory) &&
                          task.status === 'completed' &&
                          task.text
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center">
                          No Tasks in In Completed
                        </div>
                      )}

                      {tasks
                        .filter(
                          (task) =>
                            (filterCategory === 'all' ||
                              task.category === filterCategory) &&
                            task.status === 'completed' &&
                            task.text
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((task, index) => renderDraggableTask(task, index))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Row>
          </Col>
        </div>
      </DragDropContext>
      <TaskEditModal
        isOpen={editModalOpen}
        toggle={toggleEditModal}
        taskId={editingTaskId || ''}
        onTaskEdited={fetchTasks}
      />
    </div>
  );
};
export default TaskListView;
