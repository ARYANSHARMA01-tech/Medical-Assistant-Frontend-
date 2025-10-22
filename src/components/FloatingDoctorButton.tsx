import { useState } from "react";
import { Stethoscope, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Doctor {
  name: string;
  specialization: string | null;
  hospital: string | null;
  address: Address;
  contact: string;
  rating: number | null;
}

interface DoctorResponse {
  count: number;
  doctors: Doctor[];
}

export const FloatingDoctorButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [disease, setDisease] = useState("");
  const [symptom, setSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!disease.trim() && !symptom.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least one field (disease or symptom).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (disease.trim()) params.append("disease", disease.trim());
      if (symptom.trim()) params.append("symptom", symptom.trim());

      // const url = `http://127.0.0.1:8000/find_doctors?${params.toString()}`;
            const url = `https://brand-sunrise-production-keys.trycloudflare.com/find_doctors?${params.toString()}`;
      console.log("Doctor search request:", { method: "GET", url });
      const response = await axios.get<DoctorResponse>(url);

      setDoctors(response.data.doctors || []);
      setShowResults(true);
      
      toast({
        title: "✅ Request sent to doctor successfully!",
        description: `Found ${response.data.count} doctors for you.`,
      });
    } catch (error) {
      console.error("Error finding doctors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowResults(false);
    setDisease("");
    setSymptom("");
    setDoctors([]);
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-110"
        >
          <Stethoscope className="h-7 w-7" />
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Stethoscope className="h-6 w-6 text-primary" />
              Find Doctors
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-6 mt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="disease">Disease</Label>
                  <Input
                    id="disease"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    placeholder="e.g., Heart attack, Diabetes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptom">Symptom</Label>
                  <Input
                    id="symptom"
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="e.g., Chest pain, Fatigue"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Find Doctors"}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Found {doctors.length} Doctors
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResults(false)}
                  >
                    New Search
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {doctors.map((doctor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-lg mb-2">{doctor.name}</h4>
                      
                      {doctor.specialization && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Specialization:</span> {doctor.specialization}
                        </p>
                      )}
                      
                      {doctor.hospital && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Hospital:</span> {doctor.hospital}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Address:</span>{" "}
                        {doctor.address.line1}
                        {doctor.address.line2 && `, ${doctor.address.line2}`}, {doctor.address.city}, {doctor.address.state} {doctor.address.zip}
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Contact:</span>{" "}
                        <a href={`tel:${doctor.contact}`} className="text-primary hover:underline">
                          {doctor.contact}
                        </a>
                      </p>
                      
                      {doctor.rating && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Rating:</span> ⭐ {doctor.rating}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};
