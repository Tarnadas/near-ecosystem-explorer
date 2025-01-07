import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import CategoryCard from '@/components/CategoryCard';
import ProjectsGrid from '@/components/ProjectsGrid';
import MasonryLayout from '@/components/MasonryLayout';
import { categorizeProjects } from '@/utils/projectUtils';
import type { ProjectsResponse } from '@/types/projects';

const fetchProjects = async (): Promise<ProjectsResponse> => {
  const response = await fetch('https://api.nearcatalog.xyz/projects');
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};

const breakpointColumns = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const categorizedProjects = React.useMemo(() => {
    if (!projectsData) return {};
    return categorizeProjects(projectsData);
  }, [projectsData]);

  const handleCategoryClick = (key: string) => {
    try {
      setSelectedCategory(key);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load category details. Please try again.",
        variant: "destructive",
      });
      console.error("Error selecting category:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Projects</h2>
          <p className="text-red-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">NEAR Protocol Ecosystem Map</h1>
        
        <MasonryLayout breakpointColumns={breakpointColumns}>
          {Object.entries(categorizedProjects).map(([key, category]) => (
            <CategoryCard
              key={key}
              title={category.title}
              color={category.color}
              projects={category.projects}
              onClick={() => handleCategoryClick(key)}
            />
          ))}
        </MasonryLayout>

        {selectedCategory && categorizedProjects[selectedCategory] && (
          <ProjectsGrid
            title={categorizedProjects[selectedCategory].title}
            projects={categorizedProjects[selectedCategory].projects}
          />
        )}
      </div>
    </div>
  );
};

export default Index;