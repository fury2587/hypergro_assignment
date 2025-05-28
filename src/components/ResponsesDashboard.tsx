
import React, { useState, useMemo } from 'react';
import { useFormStore } from '../store/formStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, BarChart3, Calendar } from 'lucide-react';
import { FormResponse } from '../types/form';

export const ResponsesDashboard: React.FC = () => {
  const { currentForm, responses, theme } = useFormStore();
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  const formResponses = useMemo(() => {
    if (!currentForm) return [];
    return responses.filter(response => response.formId === currentForm.id);
  }, [responses, currentForm]);

  const exportToCSV = () => {
    if (!currentForm || formResponses.length === 0) return;

    const headers = ['Response ID', 'Submitted At'];
    const fieldHeaders = currentForm.steps.flatMap(step => 
      step.fields.map(field => field.label)
    );
    headers.push(...fieldHeaders);

    const csvContent = [
      headers.join(','),
      ...formResponses.map(response => {
        const row = [response.id, new Date(response.submittedAt).toLocaleString()];
        const fieldValues = currentForm.steps.flatMap(step =>
          step.fields.map(field => response.data[field.id] || '')
        );
        row.push(...fieldValues);
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentForm.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!currentForm || formResponses.length === 0) return;

    const jsonData = {
      formId: currentForm.id,
      formTitle: currentForm.title,
      exportedAt: new Date().toISOString(),
      totalResponses: formResponses.length,
      responses: formResponses
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentForm.title}_responses.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!currentForm) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No form selected. Please create or load a form first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Form Responses
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and analyze responses for "{currentForm.title}"
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formResponses.length}</div>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Response</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formResponses.length > 0 
                  ? new Date(Math.max(...formResponses.map(r => new Date(r.submittedAt).getTime()))).toLocaleDateString()
                  : 'No responses'
                }
              </div>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Fields</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentForm.steps.reduce((total, step) => total + step.fields.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={formResponses.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={exportToJSON} 
            variant="outline"
            disabled={formResponses.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* Responses Content */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Response List</TabsTrigger>
            <TabsTrigger value="details">Response Details</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>All Responses</CardTitle>
                <CardDescription>
                  Click on a response to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formResponses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No responses yet. Share your form to start collecting responses!
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Response ID</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formResponses.map((response) => (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">
                            {response.id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            {new Date(response.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Complete</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResponse(response)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>Response Details</CardTitle>
                <CardDescription>
                  {selectedResponse 
                    ? `Viewing response ${selectedResponse.id.slice(-8)}`
                    : 'Select a response from the list to view details'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedResponse ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Response Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Response ID:</label>
                          <p className="text-sm text-muted-foreground">{selectedResponse.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Submitted At:</label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedResponse.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Form Answers</h3>
                      <div className="space-y-4">
                        {currentForm.steps.map(step => (
                          <div key={step.id}>
                            <h4 className="font-medium mb-2">{step.title}</h4>
                            <div className="space-y-3 pl-4">
                              {step.fields.map(field => (
                                <div key={field.id} className="border-l-2 border-gray-200 pl-4">
                                  <label className="text-sm font-medium">{field.label}:</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedResponse.data[field.id] || 'No answer provided'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Select a response from the list to view its details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
