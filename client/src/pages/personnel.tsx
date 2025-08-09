import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, User, Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PersonnelForm from "@/components/forms/personnel-form";
import { queryClient } from "@/lib/queryClient";
import type { Personnel } from "@shared/schema";

export default function PersonnelPage() {
  const [, setLocation] = useLocation();
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | undefined>();

  // Personnel query
  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ['/api/personnel'],
  });

  // Delete mutation
  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/personnel/${id}`, { 
        method: 'DELETE' 
      });
      if (!response.ok) throw new Error('Silme işlemi başarısız');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personnel'] });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-dark-accent"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-dark-secondary border-dark-accent animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-dark-accent"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
      </div>

      {/* Add Personnel Button */}
      <div className="mb-6">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => {
            setSelectedPersonnel(undefined);
            setShowPersonnelForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Personel
        </Button>
      </div>

      {/* Personnel Cards */}
      {personnel.length === 0 ? (
        <Card className="bg-dark-secondary border-dark-accent">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Henüz personel eklenmemiş</p>
            <p className="text-gray-500 text-sm">Yeni personel eklemek için yukarıdaki butonu kullanın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((person) => (
            <Card 
              key={person.id} 
              className="bg-dark-secondary border-dark-accent hover:border-blue-500/50 transition-colors cursor-pointer group"
              onClick={() => setLocation(`/personnel/${person.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Personnel Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-lg truncate">{person.name}</h4>
                    <p className="text-gray-400 text-sm truncate">{person.position}</p>
                    <p className="text-green-400 text-sm">₺{(person.salary || 0).toLocaleString('tr-TR')}/ay</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-dark-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPersonnel(person);
                        setShowPersonnelForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-dark-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`${person.name} adlı personeli silmek istediğinizden emin misiniz?`)) {
                          deletePersonnelMutation.mutate(person.id);
                        }
                      }}
                      disabled={deletePersonnelMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Forms */}
      <PersonnelForm 
        open={showPersonnelForm} 
        onOpenChange={(open) => {
          setShowPersonnelForm(open);
          if (!open) {
            setSelectedPersonnel(undefined);
          }
        }}
        personnel={selectedPersonnel}
      />
    </div>
  );
}