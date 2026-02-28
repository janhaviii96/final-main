import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  mode?: "select" | "display";
  maxSkills?: number;
}

const SkillSelector = ({
  selectedSkills,
  onSkillsChange,
  mode = "select",
  maxSkills = 10,
}: SkillSelectorProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("category", { ascending: true });

    if (!error && data) {
      setSkills(data);
    }
    setLoading(false);
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      onSkillsChange(selectedSkills.filter((id) => id !== skillId));
    } else if (selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, skillId]);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading skills...</div>;
  }

  if (mode === "display") {
    const selectedSkillNames = skills
      .filter((s) => selectedSkills.includes(s.id))
      .map((s) => s.name);

    return (
      <div className="flex flex-wrap gap-2">
        {selectedSkillNames.length === 0 ? (
          <span className="text-sm text-muted-foreground">No skills selected</span>
        ) : (
          selectedSkillNames.map((name) => (
            <Badge key={name} variant="secondary">
              {name}
            </Badge>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedSkills.length}/{maxSkills} selected
        </span>
      </div>

      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {categorySkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <Button
                  key={skill.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={isSelected ? "bg-primary" : ""}
                  onClick={() => toggleSkill(skill.id)}
                >
                  {isSelected ? (
                    <X className="w-3 h-3 mr-1" />
                  ) : (
                    <Plus className="w-3 h-3 mr-1" />
                  )}
                  {skill.name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillSelector;
