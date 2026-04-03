import React, { useEffect, useState } from 'react'
import { useNavigate, useRoutes, Navigate } from 'react-router-dom'

// Pages Lists
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/user/Profile';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';

// Auth Context
import { useAuth } from './authContext';

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('userID');
        if (storedUser && !currentUser) {
            setCurrentUser(storedUser);
        }

        const openPaths = ['/auth', '/signup'];
        if (!storedUser && !openPaths.includes(window.location.pathname)) {
            navigate('/auth');
        }

        if (storedUser && window.location.pathname === '/auth') {
            navigate('/dashboard');
        }

    }, [navigate, currentUser, setCurrentUser]);

    let element = useRoutes([
        {
            path: '/',
            element: <Navigate to="/dashboard" replace />
        },
        {
            path: '/dashboard',
            element: <Dashboard />
        },
        {
            path: '/profile',
            element: <Profile />
        },
        {
            path: '/signup',
            element: <SignUp />
        },
        {
            path: '/auth',
            element: <Login />
        }
    ]);

    return element;
}

export default ProjectRoutes;
