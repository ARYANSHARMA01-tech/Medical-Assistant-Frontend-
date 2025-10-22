import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Image, Globe, Zap, Shield, Brain } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-medical-ai.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: "Fast Diagnosis",
      description: "Get instant AI-powered insights into your symptoms within seconds",
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Communicate in English, Arabic, and French for accessible healthcare",
    },
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Advanced deep learning models analyze skin conditions accurately",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                AI Medical Assistant +{" "}
                <span className="gradient-primary bg-clip-text">
                  Skin Disease Detector
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Empowering health with AI diagnostics. Get instant symptom analysis and skin disease detection powered by advanced machine learning.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/symptom-analysis">
                  <Button variant="hero" size="lg">
                    <MessageSquare className="mr-2" />
                    Start Symptom Analysis
                  </Button>
                </Link>
                <Link to="/image-analysis">
                  <Button variant="outline" size="lg">
                    <Image className="mr-2" />
                    Analyze Skin Image
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-large">
                <img
                  src={heroImage}
                  alt="AI Medical Assistant Interface"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">About Our AI System</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Our advanced AI Medical Assistant combines Natural Language Processing (NLP) and deep learning to provide accurate health insights.
              </p>
              <p>
                <span className="text-primary font-semibold">Symptom Analysis:</span> Describe your symptoms in English, Arabic, or French, and receive instant disease predictions with detailed precautions.
              </p>
              <p>
                <span className="text-primary font-semibold">Image Detection:</span> Upload images of skin conditions to identify potential diseases using state-of-the-art computer vision models.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Helps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of AI-driven healthcare diagnostics
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full gradient-card shadow-medium hover:shadow-large transition-smooth border-border">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Experience the future of healthcare diagnostics with our AI-powered tools
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/symptom-analysis">
                <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Try Symptom Analysis
                </Button>
              </Link>
              <Link to="/image-analysis">
                <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Try Image Detection
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
