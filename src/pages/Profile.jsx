
import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/api';
import axios from 'axios';

const Profile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [success, setSuccess] = useState('');
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await userAPI.getMe();
				setUser(userData);
				setName(userData.name || '');
			} catch (err) {
				setError('Failed to load profile');
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, []);

	const handleUpdate = async (e) => {
		e.preventDefault();
		setUpdating(true);
		setError('');
		setSuccess('');
		try {
			await axios.patch('/api/auth/update', {
				id: user.id,
				name,
				password: password || undefined,
			});
			setSuccess('Profile updated successfully!');
			setPassword('');
			// Optionally refetch user
			const userData = await userAPI.getMe();
			setUser(userData);
			setName(userData.name || '');
		} catch (err) {
			setError('Failed to update profile');
		} finally {
			setUpdating(false);
		}
	};

	if (loading) return <div className="p-8 text-center">Loading...</div>;
	if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
	if (!user) return <div className="p-8 text-center">No user data found.</div>;

	return (
		<div className="w-full max-w-2xl mx-auto py-8 px-4">
			<h1 className="text-3xl font-extrabold mb-6 text-blue-900">Profile</h1>
			<div className="flex flex-col items-center mb-8">
				<img
					src={user.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=2563eb&color=fff&size=120'}
					alt="Profile"
					className="w-28 h-28 rounded-full object-cover mb-2 border-4 border-blue-200 shadow-lg"
				/>
				<div className="text-2xl font-semibold mt-2 text-blue-800">{user.name}</div>
				<div className="text-gray-600">{user.email}</div>
				<div className="text-gray-500 text-sm mt-1">Role: {user.role}</div>
			</div>
			<form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-blue-100">
				<div>
					<label className="block font-semibold mb-1 text-blue-900">Name</label>
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>
				<div>
					<label className="block font-semibold mb-1 text-blue-900">New Password</label>
					<input
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder="Leave blank to keep current"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all duration-200 disabled:opacity-60"
					disabled={updating}
				>
					{updating ? 'Updating...' : 'Update Profile'}
				</button>
				{success && <div className="text-green-600 text-center font-semibold">{success}</div>}
				{error && <div className="text-red-600 text-center font-semibold">{error}</div>}
			</form>
		</div>
	);
};

export default Profile;
