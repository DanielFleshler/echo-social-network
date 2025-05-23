import api from "./api";

const USER_URL = "/users";

const UserService = {
	getProfile: async () => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${USER_URL}/me`, { headers });
		return response.data;
	},

	updateProfile: async (userData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(`${USER_URL}/updateMe`, userData, {
			headers,
		});
		if (response.data.data.user) {
			localStorage.setItem("user", JSON.stringify(response.data.data.user));
		}
		return response.data;
	},

	changePassword: async (passwordCurrent, password, passwordConfirm) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(
			`${USER_URL}/update-password`,
			{
				passwordCurrent,
				password,
				passwordConfirm,
			},
			{ headers }
		);
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
		}
		return response.data;
	},

	updateProfileInfo: async (profileData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(
			`${USER_URL}/updateProfileInfo`,
			profileData,
			{ headers }
		);
		return response.data;
	},

	updateProfilePicture: async (formData) => {
		try {
			const token = localStorage.getItem("token");
			const response = await api.patch(
				`${USER_URL}/update-profile-picture`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.data.user) {
				const currentUser = JSON.parse(localStorage.getItem("user"));
				currentUser.profilePicture = response.data.data.user.profilePicture;
				localStorage.setItem("user", JSON.stringify(currentUser));
			}

			return response.data;
		} catch (error) {
			console.error("Update profile picture error:", error);
			throw error;
		}
	},

	deleteProfilePicture: async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await api.delete(`${USER_URL}/delete-profile-picture`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.data.user) {
				const currentUser = JSON.parse(localStorage.getItem("user"));
				currentUser.profilePicture = null;
				localStorage.setItem("user", JSON.stringify(currentUser));
			}

			return response.data;
		} catch (error) {
			console.error("Delete profile picture error:", error);
			throw error;
		}
	},

	updateUserInStorage: (userData) => {
		const currentUser = JSON.parse(localStorage.getItem("user"));
		const updatedUser = { ...currentUser, ...userData };
		localStorage.setItem("user", JSON.stringify(updatedUser));
	},
};

export default UserService;
