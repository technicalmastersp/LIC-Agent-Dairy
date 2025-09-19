import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, getUserRecords } from "@/utils/auth";
import { Save, User, X } from "lucide-react";

interface Record {
  /* id: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  age: string;
  occupation: string;
  address: string;
  currentPolicy: {
    policyNumber: string;
    sumAssured: string;
    branch: string;
  };
  createdAt: string; */
  id: string;
  date: string;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  name: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  address: string;
  dateOfBirth: string;
  age: string;
  occupation: string;
  educationalQualification: string;
  designationOfPolicyHolder: string;
  incomeDetail: string;
  periodOfService: string;
  employerName: string;
  aadhaarLikedMobileNumber: string;
  nameOfNominee: string;
  ageOfNominee: string;
  relationName: string;
  childrenBirthDate: string;
  height: string;
  weight: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;

  currentPolicy : {
    policyNumber: string;
    issueDate: string;
    sumAssured: string;
    modeOfInstallment: string;
    branch: string;
    lastPaymentDate: string;
  }

  previousPolicy : {
    policyNumber: string;
    issueDate: string;
    sumAssured: string;
    modeOfInstallment: string;
    branch: string;
    lastPaymentDate: string;
  }
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
    date: "",
    aadhaarNumber: "",
    panNumber: "",
    email: "",

    name: "",
    birthPlace: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    address: "",
    dateOfBirth: "",
    age: "",
    occupation: "",
    educationalQualification: "",
    designationOfPolicyHolder: "",
    incomeDetail: "",
    periodOfService: "",
    employerName: "",
    aadhaarLikedMobileNumber: "",
    nameOfNominee: "",
    ageOfNominee: "",
    relationName: "",
    childrenBirthDate: "",
    height: "",
    weight: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",

    // currentPolicy 
    policyNumber: "",
    issueDate: "",
    sumAssured: "",
    modeOfInstallment: "",
    branch: "",
    lastPaymentDate: "",

    // previousPolicy 
    policyNumber_previousPolicy: "",
    issueDate_previousPolicy: "",
    sumAssured_previousPolicy: "",
    modeOfInstallment_previousPolicy: "",
    branch_previousPolicy: "",
    lastPaymentDate_previousPolicy: "",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        date: record.date,
        aadhaarNumber: record.aadhaarNumber,
        panNumber: record.panNumber,
        email: record.email,
        name: record.name,
        birthPlace: record.birthPlace,
        fatherName: record.fatherName,
        motherName: record.motherName,
        spouseName: record.spouseName,
        address: record.address,
        dateOfBirth: record.dateOfBirth,
        age: record.age,
        occupation: record.occupation,
        educationalQualification: record.educationalQualification,
        designationOfPolicyHolder: record.designationOfPolicyHolder,
        incomeDetail: record.incomeDetail,
        periodOfService: record.periodOfService,
        employerName: record.employerName,
        aadhaarLikedMobileNumber: record.aadhaarLikedMobileNumber,
        nameOfNominee: record.nameOfNominee,
        ageOfNominee: record.ageOfNominee,
        relationName: record.relationName,
        childrenBirthDate: record.childrenBirthDate,
        height: record.height,
        weight: record.weight,
        bankAccountNumber: record.bankAccountNumber,
        ifscCode: record.ifscCode,
        bankName: record.bankName,
        branchName: record.branchName,

        // currentPolicy
        policyNumber: record.currentPolicy.policyNumber,
        issueDate: record.currentPolicy.issueDate,
        sumAssured: record.currentPolicy.sumAssured,
        modeOfInstallment: record.currentPolicy.modeOfInstallment,
        branch: record.currentPolicy.branch,
        lastPaymentDate: record.currentPolicy.lastPaymentDate,

        // previousPolicy
        policyNumber_previousPolicy: record.previousPolicy.policyNumber,
        issueDate_previousPolicy: record.previousPolicy.issueDate,
        sumAssured_previousPolicy: record.previousPolicy.sumAssured,
        modeOfInstallment_previousPolicy: record.previousPolicy.modeOfInstallment,
        branch_previousPolicy: record.previousPolicy.branch,
        lastPaymentDate_previousPolicy: record.previousPolicy.lastPaymentDate,
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
              date: formData.date,
              aadhaarNumber: formData.aadhaarNumber,
              panNumber: formData.panNumber,
              email: formData.email,
              name: formData.name,
              birthPlace: formData.birthPlace,
              fatherName: formData.fatherName,
              motherName: formData.motherName,
              spouseName: formData.spouseName,
              address: formData.address,
              dateOfBirth: formData.dateOfBirth,
              age: formData.age,
              occupation: formData.occupation,
              educationalQualification: formData.educationalQualification,
              designationOfPolicyHolder: formData.designationOfPolicyHolder,
              incomeDetail: formData.incomeDetail,
              periodOfService: formData.periodOfService,
              employerName: formData.employerName,
              aadhaarLikedMobileNumber: formData.aadhaarLikedMobileNumber,
              nameOfNominee: formData.nameOfNominee,
              ageOfNominee: formData.ageOfNominee,
              relationName: formData.relationName,
              childrenBirthDate: formData.childrenBirthDate,
              height: formData.height,
              weight: formData.weight,
              bankAccountNumber: formData.bankAccountNumber,
              ifscCode: formData.ifscCode,
              bankName: formData.bankName,
              branchName: formData.branchName,

              currentPolicy : {
                policyNumber: formData.policyNumber,
                issueDate: formData.issueDate,
                sumAssured: formData.sumAssured,
                modeOfInstallment: formData.modeOfInstallment,
                branch: formData.branch,
                lastPaymentDate: formData.lastPaymentDate,
              },

              previousPolicy : {
                policyNumber: formData.policyNumber_previousPolicy,
                issueDate: formData.issueDate_previousPolicy,
                sumAssured: formData.sumAssured_previousPolicy,
                modeOfInstallment: formData.modeOfInstallment_previousPolicy,
                branch: formData.branch_previousPolicy,
                lastPaymentDate: formData.lastPaymentDate_previousPolicy,
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
          {/* Basic Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input 
                    id="aadhaarNumber" 
                    name="aadhaarNumber" 
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">Pan Number</Label>
                  <Input 
                    id="panNumber" 
                    name="panNumber" 
                    value={formData.panNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email ID</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">1. Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">1a. Birth Place</Label>
                  <Input 
                    id="birthPlace" 
                    name="birthPlace" 
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">2. Father's Name</Label>
                  <Input 
                    id="fatherName" 
                    name="fatherName" 
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">3. Mother's Name</Label>
                  <Input 
                    id="motherName" 
                    name="motherName" 
                    value={formData.motherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouseName">4. Spouse's Name</Label>
                  <Input 
                    id="spouseName" 
                    name="spouseName" 
                    value={formData.spouseName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">5. Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">6. Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">6a. Age</Label>
                  <Input 
                    id="age" 
                    name="age" 
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">7. Occupation</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationalQualification">7a. Educational Qualification</Label>
                  <Input 
                    id="educationalQualification" 
                    name="educationalQualification" 
                    value={formData.educationalQualification}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationOfPolicyHolder">7b. Designation</Label>
                  <Input 
                    id="designationOfPolicyHolder" 
                    name="designationOfPolicyHolder" 
                    value={formData.designationOfPolicyHolder}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incomeDetail">7c. Income Detail</Label>
                  <Input 
                    id="incomeDetail" 
                    name="incomeDetail" 
                    value={formData.incomeDetail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodOfService">7d. Period Of Service</Label>
                  <Input 
                    id="periodOfService" 
                    name="periodOfService" 
                    value={formData.periodOfService}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerName">7e. Employer's Name</Label>
                  <Input 
                    id="employerName" 
                    name="employerName" 
                    value={formData.employerName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarLikedMobileNumber">7f. Aadhaar liked Mobile Number </Label>
                  <Input 
                    id="aadhaarLikedMobileNumber" 
                    name="aadhaarLikedMobileNumber" 
                    value={formData.aadhaarLikedMobileNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameOfNominee">8. Name of Nominee</Label>
                  <Input 
                    id="nameOfNominee" 
                    name="nameOfNominee" 
                    value={formData.nameOfNominee}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageOfNominee">8a. Age of Nominee</Label>
                  <Input 
                    id="ageOfNominee" 
                    name="ageOfNominee" 
                    value={formData.ageOfNominee}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationName">8b. Relation</Label>
                  <Input 
                    id="relationName" 
                    name="relationName" 
                    value={formData.relationName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">10. Height</Label>
                  <Input 
                    id="height" 
                    name="height" 
                    value={formData.height}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">10a. Weight</Label>
                  <Input 
                    id="weight" 
                    name="weight" 
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childrenBirthDate">11. Children's Birth Date</Label>
                  <Input 
                    id="childrenBirthDate" 
                    name="childrenBirthDate" 
                    type="date"
                    value={formData.childrenBirthDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">12. Bank Account Number</Label>
                  <Input 
                    id="bankAccountNumber" 
                    name="bankAccountNumber" 
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">12a. IFSC Code</Label>
                  <Input 
                    id="ifscCode" 
                    name="ifscCode" 
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">12b. Bank Name</Label>
                  <Input 
                    id="bankName" 
                    name="bankName" 
                    value={formData.bankName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchName">12c. Branch Name</Label>
                  <Input 
                    id="branchName" 
                    name="branchName" 
                    value={formData.branchName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Current Policy Information</CardTitle>
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
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured">Sum Assured</Label>
                  <Input
                    id="sumAssured"
                    name="sumAssured"
                    value={formData.sumAssured}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfInstallment">Mode of Installment</Label>
                  <Input
                    id="modeOfInstallment"
                    name="modeOfInstallment"
                    value={formData.modeOfInstallment}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate">Last Payment Date</Label>
                  <Input
                    id="lastPaymentDate"
                    name="lastPaymentDate"
                    type="date"
                    value={formData.lastPaymentDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-lg">Previous Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber_previousPolicy">Policy Number</Label>
                  <Input
                    id="policyNumber_previousPolicy"
                    name="policyNumber_previousPolicy"
                    value={formData.policyNumber_previousPolicy}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate_previousPolicy">Issue Date</Label>
                  <Input
                    id="issueDate_previousPolicy"
                    name="issueDate_previousPolicy"
                    value={formData.issueDate_previousPolicy}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured_previousPolicy">Sum Assured</Label>
                  <Input
                    id="sumAssured_previousPolicy"
                    name="sumAssured_previousPolicy"
                    value={formData.sumAssured_previousPolicy}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfInstallment_previousPolicy">Mode of Installment</Label>
                  <Input
                    id="modeOfInstallment_previousPolicy"
                    name="modeOfInstallment_previousPolicy"
                    value={formData.modeOfInstallment_previousPolicy}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch_previousPolicy">Branch</Label>
                  <Input
                    id="branch_previousPolicy"
                    name="branch_previousPolicy"
                    value={formData.branch_previousPolicy}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate_previousPolicy">Last Payment Date</Label>
                  <Input
                    id="lastPaymentDate_previousPolicy"
                    name="lastPaymentDate_previousPolicy"
                    type="date"
                    value={formData.lastPaymentDate_previousPolicy}
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