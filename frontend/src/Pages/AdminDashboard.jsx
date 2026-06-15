import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch Stats
  const fetchStats = async () => {
    try {

      const response = await api.get(
        "/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(response.data.stats);

    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {

      const response = await api.get(
        "/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(response.data.users);

    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Files
  const fetchFiles = async () => {
    try {

      const response = await api.get(
        "/admin/files",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFiles(response.data.files);

    } catch (error) {
      console.log(error);
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    try {

      await api.delete(
        `/admin/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchUsers();
      fetchStats();

    } catch (error) {
      console.log(error);
    }
  };

  // Delete File
  const deleteFile = async (id) => {
    try {

      await api.delete(
        `/admin/file/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchFiles();
      fetchStats();

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    fetchStats();
    fetchUsers();
    fetchFiles();

  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard 🚀
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Total Users
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Total Files
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalFiles}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Storage Used
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalStorageUsed}
          </p>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-5">
          Users
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Email</th>
              <th className="text-left py-3">Role</th>
              <th className="text-left py-3">Plan</th>
              <th className="text-left py-3">Action</th>
            </tr>
          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user._id}
                className="border-b"
              >
                <td className="py-3">
                  {user.name}
                </td>

                <td className="py-3">
                  {user.email}
                </td>

                <td className="py-3">
                  {user.role}
                </td>

                <td className="py-3">
                  {user.plan}
                </td>

                <td className="py-3">

                  <button
                    onClick={() =>
                      deleteUser(user._id)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Files Table */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-2xl font-bold mb-5">
          Files
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">
                Name
              </th>

              <th className="text-left py-3">
                Type
              </th>

              <th className="text-left py-3">
                Size
              </th>

              <th className="text-left py-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {files.map((file) => (

              <tr
                key={file._id}
                className="border-b"
              >
                <td className="py-3">
                  {file.fileName}
                </td>

                <td className="py-3">
                  {file.fileType}
                </td>

                <td className="py-3">
                  {file.fileSize}
                </td>

                <td className="py-3">

                  <button
                    onClick={() =>
                      deleteFile(file._id)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminDashboard;