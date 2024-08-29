import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function ViewUsers() {
  const [users, setUsers] = useState([]); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/users/');
        const data = response.data; 
        setUsers(data);
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <>
        <div className='container my-5'>
            <h1 className='text-center'>Users</h1>
        <table className="table table-hover table-secondary">
            <thead>
            <tr className='table-dark'>
                <th scope="col">Id</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Bio</th>
                <th scope="col">Avatar</th>
            </tr>
            </thead>
            <tbody>
            {users.map((u) => (
                <tr key={u.id}>
                    <td>{u._id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.bio}</td>
                    <td>{u.avatar}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </>
  );
}
