import React, { useState } from 'react';
import { Shield, FileText, Phone, Upload, Check, AlertCircle, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../context/LanguageContext';

interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  type: string;
  coverage: number;
  premium: number;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Pending';
}

const InsuranceSupport: React.FC = () => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const { t } = useLanguage();

  const samplePolicies: InsurancePolicy[] = [
    {
      id: '1',
      provider: 'Star Health Insurance',
      policyNumber: 'SH123456789',
      type: 'Family Floater',
      coverage: 500000,
      premium: 12000,
      expiryDate: '2025-03-15',
      status: 'Active'
    },
    {
      id: '2',
      provider: 'HDFC ERGO',
      policyNumber: 'HD987654321',
      type: 'Individual',
      coverage: 300000,
      premium: 8000,
      expiryDate: '2024-12-30',
      status: 'Active'
    }
  ];

  const insuranceProviders = [
    { name: 'Star Health Insurance', phone: '1800-425-2255', website: 'starhealth.in' },
    { name: 'HDFC ERGO', phone: '1800-2666', website: 'hdfcergo.com' },
    { name: 'ICICI Lombard', phone: '1800-2666', website: 'icicilombard.com' },
    { name: 'Bajaj Allianz', phone: '1800-209-5858', website: 'bajajallianz.com' },
    { name: 'New India Assurance', phone: '1800-209-1415', website: 'newindia.co.in' },
    { name: 'Oriental Insurance', phone: '1800-11-8485', website: 'orientalinsurance.org.in' }
  ];

  const claimSteps = [
    {
      step: 1,
      title: 'Immediate Notification',
      description: 'Inform your insurance provider within 24-48 hours of hospitalization',
      icon: Phone
    },
    {
      step: 2,
      title: 'Document Collection',
      description: 'Gather all medical bills, prescriptions, and diagnostic reports',
      icon: FileText
    },
    {
      step: 3,
      title: 'Claim Form Submission',
      description: 'Fill and submit the claim form with all required documents',
      icon: Upload
    },
    {
      step: 4,
      title: 'Follow-up',
      description: 'Track your claim status and provide additional documents if requested',
      icon: Check
    }
  ];

  const handleClaimSubmission = () => {
    // Mock claim submission
    alert('Claim submitted successfully! Reference number: CLM' + Math.random().toString(36).substr(2, 9).toUpperCase());
    setClaimAmount('');
    setClaimDescription('');
  };

  const calculatePremium = () => {
    // Mock premium calculation
    const age = 30;
    const basePremium = 8000;
    const calculated = basePremium + (age * 100);
    alert(`Estimated Annual Premium: ₹${calculated.toLocaleString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Medical Insurance Support</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive insurance assistance for policies and claims
        </p>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="claims">File Claim</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        {/* My Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Insurance Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {samplePolicies.map((policy) => (
                <Card key={policy.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{policy.provider}</h3>
                          <Badge variant={policy.status === 'Active' ? 'default' : 'secondary'}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Policy: {policy.policyNumber} | Type: {policy.type}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>Coverage: ₹{policy.coverage.toLocaleString()}</span>
                          <span>Premium: ₹{policy.premium.toLocaleString()}/year</span>
                          <span>Expires: {policy.expiryDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Download Policy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button className="w-full" variant="outline">
                Add New Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Claim Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File New Claim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Policy Number</label>
                  <Input
                    placeholder="Enter policy number"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Claim Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter claim amount"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your medical condition and treatment"
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Documents</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drop files here or click to upload
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>
                
                <Button onClick={handleClaimSubmission} className="w-full">
                  Submit Claim
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Process Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claimSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.step} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning">Important Note</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Keep all original documents safe and submit only photocopies unless specifically requested.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Providers Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insuranceProviders.map((provider) => (
                  <Card key={provider.name} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{provider.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          <span>{provider.phone}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `tel:${provider.phone}`}
                          >
                            Call
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => window.open(`https://${provider.website}`, '_blank')}
                          >
                            Visit Website
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Premium Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Input type="number" placeholder="Enter your age" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Coverage Amount</label>
                  <Input type="number" placeholder="Desired coverage amount" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Family Members</label>
                  <Input type="number" placeholder="Number of family members" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input placeholder="Your city" />
                </div>
              </div>
              
              <Button onClick={calculatePremium} className="w-full">
                Calculate Premium
              </Button>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Factors affecting premium:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Age and health condition</li>
                  <li>• Coverage amount and type</li>
                  <li>• Family medical history</li>
                  <li>• City and hospital network</li>
                  <li>• Policy duration and features</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceSupport;