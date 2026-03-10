import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { KE_CONSTANTS } from "@/lib/constants";

const steps = ["Shop details", "Business type", "Finish"];

const OnboardingWizard = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => navigate("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="card w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Onboarding</p>
            <h1 className="text-2xl font-bold text-slate-900">Set up your shop</h1>
          </div>
          <p className="text-sm text-slate-500">Step {step + 1} of {steps.length}</p>
        </div>

        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Shop name</Label>
              <Input placeholder="Mama Wanjiku General Store" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="0712345678" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Location</Label>
              <Input placeholder="Tom Mboya Street, Nairobi" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Business type</Label>
              <Select>
                {KE_CONSTANTS.businessTypes.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Default currency</Label>
              <Input value="KES" disabled />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">You're all set. Next we will take you to the dashboard.</p>
            <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
              <li>Invite cashiers and managers</li>
              <li>Add your first products</li>
              <li>Start selling with POS</li>
            </ul>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={finish}>Go to dashboard</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
