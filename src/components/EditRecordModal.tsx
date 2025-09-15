import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, getUserRecords } from "@/utils/auth";
import { Save, X } from "lucide-react";

interface Record {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  age: string;
  occupation: string;
  address: string;
  currentPolicy: {
    policyNumber: string;
    premium: string;
    amount: string;
  };
  createdAt: string;
}

interface EditRecordModalProps {
  record: Record | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditRecordModal = ({ record, isOpen, onClose, onUpdate }: EditRecordModalProps) => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    age: "",
    occupation: "",
    address: "",
    policyNumber: "",
    premium: "",
    amount: ""
  });

  useEffect(() => {
    if (record) {
      setFormData({
        name: record.name,
        fatherName: record.fatherName,
        motherName: record.motherName,
        dateOfBirth: record.dateOfBirth,
        age: record.age,
        occupation: record.occupation,
        address: record.address,
        policyNumber: record.currentPolicy.policyNumber,
        premium: record.currentPolicy.premium,
        amount: record.currentPolicy.amount
      });
    }
  }, [record]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!currentUser || !record) return;

    try {
      const userRecordsKey = `customers-record-lists-${currentUser.id}`;
      const existingRecords = JSON.parse(localStorage.getItem(userRecordsKey) || '[]');
      
      const updatedRecords = existingRecords.map((r: Record) => 
        r.id === record.id 
          ? {
              ...r,
              name: formData.name,
              fatherName: formData.fatherName,
              motherName: formData.motherName,
              dateOfBirth: formData.dateOfBirth,
              age: formData.age,
              occupation: formData.occupation,
              address: formData.address,
              currentPolicy: {
                policyNumber: formData.policyNumber,
                premium: formData.premium,
                amount: formData.amount
              }
            }
          : r
      );
      
      localStorage.setItem(userRecordsKey, JSON.stringify(updatedRecords));
      
      toast({
        title: "Success",
        description: "Record updated successfully!",
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-form-header text-xl">Edit Record</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium Amount</Label>
                  <Input
                    id="premium"
                    name="premium"
                    value={formData.premium}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Coverage Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={onClose} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-light">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordModal;