// useVisibilityObserver.svelte.ts
export function useVisibilityObserver(element) {
	// Define a reactive state variable (using a new name internally if needed)
	let visible = $state(false);
  
	$effect(() => {
	  if (!element) return; // Wait until the element is defined
  
	  const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
		  visible = true;
		  observer.disconnect();
		}
	  });
  
	  observer.observe(element);
  
	  return () => observer.disconnect();
	});
  
	// Return an object with a getter for reactivity.
	return {
	  get isVisible() {
		return visible;
	  }
	};
  }