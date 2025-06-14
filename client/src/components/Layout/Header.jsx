import {
	Bell,
	Home,
	LogOut,
	Search,
	Settings,
	Sparkles,
	User,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../UI/NotificationsDropdown";
import ProfileAvatar from "../UI/ProfileAvatar";
import SearchModal from "../UI/SearchModal";

export default function Header() {
	const { user, logout } = useAuth();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchAnchorRect, setSearchAnchorRect] = useState(null);
	const searchButtonRef = useRef(null);
	const notificationsButtonRef = useRef(null);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [notificationsAnchorRect, setNotificationsAnchorRect] = useState(null);
	const location = useLocation();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const handleOpenSearch = () => {
		if (searchButtonRef.current) {
			setSearchAnchorRect(searchButtonRef.current.getBoundingClientRect());
		}
		setIsSearchOpen(true);
		setIsNotificationsOpen(false);
	};

	const handleCloseSearch = () => {
		setIsSearchOpen(false);
	};

	const handleToggleNotifications = () => {
		if (notificationsButtonRef.current) {
			setNotificationsAnchorRect(
				notificationsButtonRef.current.getBoundingClientRect()
			);
		}
		setIsNotificationsOpen(!isNotificationsOpen);
		if (isSearchOpen) setIsSearchOpen(false);
	};

	const handleCloseNotifications = () => {
		setIsNotificationsOpen(false);
	};

	const isActive = (path) => {
		return (
			location.pathname === path || location.pathname.startsWith(`${path}/`)
		);
	};

	return (
		<>
			<header className="sticky top-0 z-20 border-b border-gray-800/20 bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-black/10">
				<div className="container flex h-16 items-center justify-between px-4">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<Link to="/" className="flex items-center gap-2 group">
							<Sparkles className="h-6 w-6 text-purple-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
							<span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-400 group-hover:to-blue-400">
								Echo
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="flex items-center gap-6">
						<Link
							to="/"
							className={`text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
								isActive("/")
									? "text-purple-400"
									: "text-gray-200 hover:text-purple-400"
							}`}
						>
							<Home className="h-4 w-4" />
							Feed
						</Link>
						<Link
							to="/rooms"
							className={`text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
								isActive("/rooms")
									? "text-purple-400"
									: "text-gray-200 hover:text-purple-400"
							}`}
						>
							<Users className="h-4 w-4" />
							Rooms
						</Link>
						<button
							ref={searchButtonRef}
							onClick={handleOpenSearch}
							className="text-sm font-medium text-gray-200 hover:text-purple-400 flex items-center gap-1.5 cursor-pointer transition-all duration-200"
						>
							<Search className="h-4 w-4" />
							Search
						</button>
						<button
							ref={notificationsButtonRef}
							onClick={handleToggleNotifications}
							className="text-sm font-medium text-gray-200 hover:text-purple-400 flex items-center gap-1.5 cursor-pointer transition-all duration-200 relative"
						>
							<Bell className="h-4 w-4" />
							Notifications
							<span className="flex h-1.5 w-1.5 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
							</span>
						</button>
					</nav>

					{/* User Profile & Menu */}
					{user && (
						<div className="flex items-center gap-4">
							<div className="relative group">
								<button className="rounded-full p-2 hover:bg-gray-800/70 transition-colors duration-200">
									<ProfileAvatar user={user} size="xs" />
									<span className="sr-only">Profile</span>
								</button>
								<div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-gray-800/50 bg-gray-900/90 shadow-xl shadow-black/20 backdrop-blur-sm focus:outline-none invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250 ease-out z-[999]">
									<div className="py-2">
										<div className="px-4 py-3 text-sm text-gray-200 border-b border-gray-800/50">
											<div className="font-medium">
												{user.fullName || "User"}
											</div>
											<div className="text-xs text-gray-400 truncate">
												{user.email}
											</div>
										</div>
										<Link
											to="/profile"
											className="flex items-center gap-2 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800/70 transition-colors duration-150"
										>
											<User className="h-4 w-4" />
											Your Profile
										</Link>
										<Link
											to="/settings"
											className="flex items-center gap-2 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800/70 transition-colors duration-150"
										>
											<Settings className="h-4 w-4" />
											Settings
										</Link>
										<div className="border-t border-gray-800/50 mt-1 pt-1">
											<button
												onClick={handleLogout}
												className="w-full text-left flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-800/70 hover:text-red-300 transition-colors duration-150"
											>
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Floating Bubble Search */}
			<SearchModal
				isOpen={isSearchOpen}
				onClose={handleCloseSearch}
				anchorRect={searchAnchorRect}
			/>

			{/* Notifications Dropdown */}
			<NotificationsDropdown
				isOpen={isNotificationsOpen}
				onClose={handleCloseNotifications}
				anchorRect={notificationsAnchorRect}
			/>
		</>
	);
}
