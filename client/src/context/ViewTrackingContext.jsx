import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useMemo,
} from "react";
import PostService from "../services/post.service";

const ViewTrackingContext = createContext();

export const ViewTrackingProvider = ({ children }) => {
	const [pendingViews, setPendingViews] = useState(new Set());
	const [isProcessing, setIsProcessing] = useState(false);
	const [viewCounts, setViewCounts] = useState({});
	const initializedPosts = useRef(new Set());
	const timerRef = useRef(null);
	const batchSizeThreshold = 5; // Process when we reach this many views

	// Track a post view
	const trackView = useCallback((postId) => {
		if (!postId) return;

		// Add the post ID to the pending views set
		setPendingViews((prevViews) => {
			const newViews = new Set(prevViews);
			newViews.add(postId);
			return newViews;
		});

		// Process immediately if we've reached the threshold
		if (pendingViews.size >= batchSizeThreshold) {
			processBatch();
		}
	}, [pendingViews]);

	// Get the view count for a specific post
	const getViewCount = useCallback(
		(postId) => {
			return viewCounts[postId] || 0;
		},
		[viewCounts]
	);

	// Process pending views in batch - extracted as a named function to call directly
	const processBatch = useCallback(async () => {
		if (pendingViews.size === 0 || isProcessing) return;

		setIsProcessing(true);
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		try {
			const postIds = Array.from(pendingViews);
			console.log(`Processing batch of ${postIds.length} views`);

			const result = await PostService.batchIncrementViews(postIds);

			// If batchIncrementViews was successful, 'result' contains the success data.
			// Assuming 'result' has a 'status' field and 'data.updatedCounts' upon success from the service structure.
			if (result.status === "success" && result.data && result.data.updatedCounts) {
				setPendingViews(new Set());
				setViewCounts((prev) => ({
					...prev,
					...result.data.updatedCounts
				}));
			} else if (result.status === "success") { // Successful but structure might vary (e.g., no updatedCounts)
				 console.warn("ViewTrackingContext: Batch increment success but no updatedCounts, falling back to local increment.");
				 setPendingViews(new Set());
				 setViewCounts((prev) => {
					const updated = { ...prev };
					postIds.forEach((id) => {
						updated[id] = (updated[id] || 0) + 1;
					});
					return updated;
				});
			} else {
				// This case should ideally not be hit if service throws errors or returns a clear success structure.
				console.warn("ViewTrackingContext: Unexpected result structure from successful batchIncrementViews:", result);	
			}
		} catch (error) {
			console.warn(
				"ViewTrackingContext: Failed to batch increment views. Message:",
				error.message || "No specific error message returned from service."
			);
			// Pending views are not cleared here, allowing for a retry on the next batch attempt.
		} finally {
			setIsProcessing(false);
		}
	}, [pendingViews, isProcessing]);

	// Process pending views in batch with a timer
	useEffect(() => {
		// Only set a timer if we have pending views and aren't already processing
		if (pendingViews.size > 0 && !isProcessing && !timerRef.current) {
			// Create a timer to process batches
			timerRef.current = setTimeout(() => {
				processBatch();
				timerRef.current = null;
			}, 3000);
		}

		// Clean up the timer on unmount or when dependencies change
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [pendingViews, isProcessing, processBatch]);

	// Initialize view counts from initial post data - now uses useRef to prevent re-renders
	const initializeViewCount = useCallback((postId, initialCount) => {
		if (
			postId &&
			typeof initialCount === "number" &&
			!initializedPosts.current.has(postId)
		) {
			initializedPosts.current.add(postId);
			setViewCounts((prev) => {
				// Only update if the count doesn't exist or is different
				if (prev[postId] !== initialCount) {
					return {
						...prev,
						[postId]: initialCount,
					};
				}
				return prev;
			});
		}
	}, []);

	// Context value - wrap in useMemo to avoid unnecessary re-renders
	const value = useMemo(() => ({
		trackView,
		getViewCount,
		initializeViewCount,
		processBatchNow: processBatch // Expose the ability to force processing
	}), [trackView, getViewCount, initializeViewCount, processBatch]);

	// Process any remaining views when unmounting
	useEffect(() => {
		return () => {
			// On unmount, process any pending views before component is destroyed
			if (pendingViews.size > 0 && !isProcessing) {
				processBatch();
			}
		};
	}, [pendingViews, isProcessing, processBatch]);

	return (
		<ViewTrackingContext.Provider value={value}>
			{children}
		</ViewTrackingContext.Provider>
	);
};

// Custom hook for using the view tracking context
export const useViewTracking = () => {
	const context = useContext(ViewTrackingContext);
	if (!context) {
		throw new Error(
			"useViewTracking must be used within a ViewTrackingProvider"
		);
	}
	return context;
};
