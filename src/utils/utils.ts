import { Idea } from "@/types/idea";

// Calculate trending score based on engagement and time
export const calculateTrendingScore = (idea: Idea) => {
    const now = new Date().getTime();
    const postTime = new Date(idea.timestamp).getTime();
    const ageInHours = (now - postTime) / (1000 * 60 * 60); // Convert to hours
    
    // Calculate base engagement
    const engagement = (idea.likes || 0) + (idea.comments || 0) + (idea.clicks?.length || 0);
    
    // Apply time decay factor (similar to Reddit's algorithm)
    // The score decays exponentially with time
    const timeDecay = Math.pow(ageInHours + 2, 1.8);
    
    // Calculate final score
    return engagement / timeDecay;
  };
  