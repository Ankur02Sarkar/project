import React, { useState } from "react";
import {
  Home,
  Construction,
  SunIcon,
  Menu,
  X,
  Brain,
  Upload,
  BarChart,
  MessageSquare,
  Play,
  X as Close,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FeedbackForm } from "./components/FeedbackForm";
import axios from "axios";
import { jsPDF } from "jspdf"; // Import jsPDF

// Types
interface TestResult {
  confidence: number;
  label: string;
  status: "success" | "error";
}

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 bg-[#323232] rounded-xl p-6 max-w-4xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <Close className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

const TestingInterface = ({ model }: { model: string | null }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTest = async () => {
    if (!selectedFile || !model) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = async () => {
      const base64Image = reader.result?.toString().split(",")[1] || "";
      let apiUrl = "";

      switch (model) {
        case "Structural Analysis":
          apiUrl =
            "https://detect.roboflow.com/infer/workflows/project-jxvu8/custom-workflow";
          break;
        case "Safety Compliance":
          apiUrl =
            "https://detect.roboflow.com/infer/workflows/project-jxvu8/custom-workflow-2";
          break;
        default:
          setIsProcessing(false);
          return;
      }

      try {
        const response = await axios.post(
          apiUrl,
          { image: base64Image },
          {
            headers: { "Content-Type": "application/json" },
            params: { api_key: "4Gdqy3MPPMplaXVVr1yG" },
          }
        );

        const data = response.data;
        setTestResult({
          confidence: (data?.confidence || 0) * 100,
          label: data?.class || "Unknown",
          status: "success",
        });
      } catch (error) {
        
        console.error("API Error:", error);
        setTestResult({
          confidence: 0,
          label: "Error processing image",
          status: "error",
        });
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const downloadTestResult = () => {
    if (!testResult) return;
    const { confidence, label, status } = testResult;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Test Result", 10, 10);
    doc.setFontSize(12);
    doc.text(`Label: ${label}`, 10, 30);
    doc.text(`Confidence: ${confidence.toFixed(2)}%`, 10, 40);
    doc.text(`Status: ${status}`, 10, 50);

    doc.save("test_result.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Your Image</h2>
      </div>

      <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-600">
        {!previewUrl ? (
          <div className="space-y-4">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
            <label className="inline-block px-4 py-2 bg-[#8b5cf6] hover:bg-[#a78bfa] text-black rounded-lg cursor-pointer">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setTestResult(null);
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex justify-center">
          <button
            onClick={handleTest}
            disabled={isProcessing}
            className={`px-6 py-3 bg-[#8b5cf6] hover:bg-[#a78bfa] text-black rounded-lg ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Test</span>
              </>
            )}
          </button>
        </div>
      )}

      {testResult && (
        <div className="p-4 rounded-lg bg-gray-800">
          <div className="flex items-center space-x-2">
            {testResult.status === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">{testResult.label}</span>
          </div>
          <div className="mt-2 text-gray-400">
            Confidence: {testResult.confidence.toFixed(2)}%
          </div>

          <button
            onClick={downloadTestResult}
            className="mt-4 px-6 py-3 bg-[#8b5cf6] hover:bg-[#a78bfa] text-black rounded-lg"
          >
            Download Result
          </button>

              <button
                className="feedbackBtn"
                onClick={() => setShowFeedback(true)}
              >
                Add Feedback
              </button>
            </>
          )}
        </>
      ) : (
        <FeedbackForm
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

// Constants
const industries = [
  {
    title: "Structural Analysis",
    icon: <Home className="w-12 h-12 mb-4 text-[#a78bfa]" />,
    description: "Advanced wall surface crack detection for building integrity",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    benefits: ["Detect hairline cracks"],
  },
  {
    title: "Safety Compliance",
    icon: <Construction className="w-12 h-12 mb-4 text-[#a78bfa]" />,
    description: "Real-time worker safety helmet compliance monitoring",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
    benefits: [
      "Real-time safety detection",
      "OSHA compliance",
      "Enhanced safety culture",
    ],
  },
  {
    title: "Solar Panel Analysis",
    icon: <SunIcon className="w-12 h-12 mb-4 text-[#a78bfa]" />,
    description:
      "AI-powered dust and crack detection for solar panel optimization",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200",
    benefits: [
      "Detect microcracks and anomalies",
      "Monitor panel cleanliness",
      "Reduce maintenance downtime",
    ],
  },
];

const features = [
  {
    icon: <Brain className="w-8 h-8 text-[#a78bfa]" />,
    title: "Advanced AI Models",
    description:
      "State-of-the-art machine learning models trained on diverse datasets",
  },
  {
    icon: <Upload className="w-8 h-8 text-[#a78bfa]" />,
    title: "Easy Integration",
    description: "Seamless API integration with your existing systems",
  },
  {
    icon: <BarChart className="w-8 h-8 text-[#a78bfa]" />,
    title: "Detailed Analytics",
    description: "Comprehensive insights and performance metrics",
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-[#a78bfa]" />,
    title: "24/7 Support",
    description: "Round-the-clock technical assistance and guidance",
  },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTestingInterface, setShowTestingInterface] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | undefined>("");

  const handleStartTesting = (model?: string) => {
    if (model === "Solar Panel Analysis") {
      return;
    }
    setSelectedModel(model);
    setShowTestingInterface(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FEFEFE]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-[#000000]/95 backdrop-blur-sm border-b border-[#323232]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Chainfly AI" className="w-10 h-10" />
              <span className="text-xl font-bold">Chainfly AI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                Features
              </a>
              <a
                href="#models"
                className="text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                Models
              </a>
              <a
                href=".About.tsx"
                className="text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                About
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 space-y-4">
              <a
                href="#features"
                className="block text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                Features
              </a>
              <a
                href="#models"
                className="block text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                Models
              </a>
              <a
                href="#about"
                className="block text-gray-300 hover:text-[#a78bfa] transition-colors"
              >
                About
              </a>
              <button
                onClick={() => (window.location.href = "/about")} // Adjust the navigation as needed
                className="px-6 py-3 bg-[#a78bfa] hover:bg-[#8b5cf6] text-black rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Learn More
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/95 via-[#000000]/80 to-[#000000]" />
          <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center opacity-30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="animate-float">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-gradient bg-gradient-to-r from-[#F7EC38] via-[#a78bfa] to-[#DE4D38] bg-clip-text text-transparent">
              Welcome to Chainfly AI
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">
                Image Model Testing Platform
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the power of cutting-edge AI solutions for diverse
            industries.
          </p>
          <button
            onClick={() => (window.location.href = "/about")} // Adjust the navigation as needed
            className="px-6 py-3 bg-[#a78bfa] hover:bg-[#8b5cf6] text-black rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#323232]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 animate-gradient bg-gradient-to-r from-[#F7EC38] via-[#a78bfa] to-[#DE4D38] bg-clip-text text-transparent">
            Why Choose Chainfly?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-[#000000] rounded-xl hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-20 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 animate-gradient bg-gradient-to-r from-[#F7EC38] via-[#a78bfa] to-[#DE4D38] bg-clip-text text-transparent">
            AI Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-[#323232] transition-all duration-300 hover:shadow-2xl hover:shadow-[#a78bfa]/20"
              >
                <div className="aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000] to-transparent z-10" />
                  <img
                    src={industry.image}
                    alt={industry.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex flex-col items-center text-center">
                    {industry.icon}
                    <h3 className="text-2xl font-bold mb-3">
                      {industry.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{industry.description}</p>
                    <ul className="space-y-2 mb-6">
                      {industry.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-400">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleStartTesting(industry.title)}
                      className="px-6 py-3 bg-[#a78bfa] hover:bg-[#8b5cf6] text-black rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      {industry.title === "Solar Panel Analysis"
                        ? "Coming Soon"
                        : "Test Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#323232]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start testing our AI models today and experience the future of
            industry automation.
          </p>
          <button
            onClick={() => handleStartTesting()}
            className="px-8 py-4 bg-[#a78bfa] hover:bg-[#8b5cf6] text-black rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] py-12 border-t border-[#323232]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Chainfly AI" className="w-10 h-10" />
                <span className="text-xl font-bold">Chainfly AI</span>
              </div>
              <p className="text-gray-400">
                Transforming industries with advanced AI solutions.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-[#a78bfa]">
                  Features
                </li>
                <li className="cursor-pointer hover:text-[#a78bfa]">Models</li>
                <li className="cursor-pointer hover:text-[#a78bfa]">Pricing</li>
                <li className="cursor-pointer hover:text-[#a78bfa]">
                  Documentation
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-[#a78bfa]">About</li>
                <li className="cursor-pointer hover:text-[#a78bfa]">Blog</li>
                <li className="cursor-pointer hover:text-[#a78bfa]">Careers</li>
                <li className="cursor-pointer hover:text-[#a78bfa]">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-[#a78bfa]">
                  Privacy Policy
                </li>
                <li className="cursor-pointer hover:text-[#a78bfa]">
                  Terms of Service
                </li>
                <li className="cursor-pointer hover:text-[#a78bfa]">
                  Cookie Policy
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#323232] text-center text-gray-400">
            <p>©️ 2024 Chainfly AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Testing Interface Modal */}
      <Modal
        isOpen={showTestingInterface}
        onClose={() => setShowTestingInterface(false)}
      >
        <TestingInterface model={selectedModel} />
      </Modal>
    </div>
  );
}

export default App;
