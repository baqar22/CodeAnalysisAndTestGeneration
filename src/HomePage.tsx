import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="max-w-2xl mx-auto mt-12 bg-white p-6 rounded-xl shadow-md text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Home Page!</h1>
            <p className="text-gray-600 mb-8">This is the homepage of the app.</p>

            <div className="flex justify-center gap-6">
                <Link
                    to="/snapshots"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Go to Sanpshots
                </Link>

                <Link
                    to="/refactoring"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Go to Refactoring
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
