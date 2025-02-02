import React, { FC, useEffect, useState } from 'react';
import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import TaskManager from './Components/TaskManager';
import './App.css';
import { Button } from 'reactstrap';

const App: FC = () => {
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const handleViewChange = (view: 'list' | 'board') => {
    setViewMode(view);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Error signing in: ', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error logging out: ', err);
    }
  };

  return (
    <div style={{ marginTop: '50px' }}>
      {user ? (
        <>
          <div
            className="container"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <div>
              <img
                alt="Task Manager Logo"
                src="/IphoneApp.png"
                className="navbar-image1"
              />
              {'  '}
              <span style={{ alignContent: 'center' }} className="text-center">
                Task Manager
              </span>
              <br />
              <Button
                size="sm"
                className="mb-3 ml-5"
                onClick={() => handleViewChange('list')}
                color={viewMode === 'list' ? 'success' : 'primary'}
              >
                {'List'}
              </Button>
              {'         '}
              <Button
                size="sm"
                className="ml-5 mb-3"
                onClick={() => handleViewChange('board')}
                color={viewMode === 'board' ? 'success' : 'primary'}
              >
                {'Board'}
              </Button>
            </div>

            <div>
              <img src={user?.photoURL} alt="User" className="navbar-image1" />
              {'  '}
              <span style={{ alignContent: 'center' }} className="text-center">
                {user.displayName.split(' ')[1][0].toUpperCase() +
                  user.displayName.split(' ')[1].slice(1).toLowerCase()}
              </span>
              <br />
              <Button
                size="sm"
                style={{ alignContent: 'center', borderRadius: '48px' }}
                className="text-center"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>

          <div>
            <TaskManager userId={user.uid} viewMode={viewMode} />
          </div>
        </>
      ) : (
        <div className="background-container">
          <div className="content">
            <h1 className="text-black fw-bolder">Task Manager</h1>
            <button
              className="bg-dark text-white fw-bolder w-100 mt-3"
              onClick={handleGoogleSignIn}
              style={{ borderRadius: '20px' }}
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
