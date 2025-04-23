import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Grid,
} from "@chakra-ui/react";
import { Carousel } from "react-bootstrap";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { MDBCardImage, MDBCol, MDBRow } from "mdb-react-ui-kit";
import MapComponent from "./MapComponent";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Modallogin from "./Modallogin";
import Loading from "./resources/Loading";
import NotFoundComponent from "./resources/NotFound";
import { initializeRazorpay } from './razorpayUtils';
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareProduct from "./components/ShareProduct";
import StaticMap from './components/StaticMap';
import { FaDirections } from 'react-icons/fa';
import PropertyDetailsDisplay from './components/PropertyDetailsDisplay';
import MobileDetailsDisplay from './components/MobileDetailsDisplay';
import JobDetailsDisplay from './components/JobDetailsDisplay';
import FixJobData from './components/FixJobData';
import { extractPropertyData } from './utils/PropertyDataUtils';
import { extractJobData } from './utils/JobDataUtils';
import { API_BASE_URL } from "./utils/config";

const PreviewAd = ({auth}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [own, setOwn] = useState();
  const [loading, setLoading] = useState(true);
  const [NotFound, setNotFound] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const authToken = localStorage.getItem("authToken");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // New state for debug data
  const [debugData, setDebugData] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState(null);

  // for register and login
  const [staticModal, setStaticModal] = useState(false);
  const toggleShow = () => setStaticModal(!staticModal);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/previewad/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      // Process and set the data
      const productData = response.data.product;
      
      // Handle job data immediately if present
      if (productData.jobData) {
        try {
          let parsedJobData = productData.jobData;
          
          // If job data is a string, try to parse it
          if (typeof parsedJobData === 'string') {
            try {
              parsedJobData = JSON.parse(parsedJobData);
            } catch (parseError) {
              console.warn("Could not parse job data string:", parseError);
            }
          }
          
          // Ensure job data has all expected fields
          productData.jobData = {
            jobRole: parsedJobData.jobRole || productData.title || '',
            jobCategory: parsedJobData.jobCategory || productData.subcatagory || '',
            companyName: parsedJobData.companyName || productData.owner || '',
            positionType: parsedJobData.positionType || 'Full-time',
            salaryPeriod: parsedJobData.salaryPeriod || 'Monthly',
            salaryFrom: parsedJobData.salaryFrom || '',
            salaryTo: parsedJobData.salaryTo || '',
            educationRequired: parsedJobData.educationRequired || 'Any',
            experienceRequired: parsedJobData.experienceRequired || 'Fresher',
            jobLocation: parsedJobData.jobLocation || 
              (productData.address && productData.address[0] ? 
                `${productData.address[0].city}, ${productData.address[0].state}` : ''),
            skills: parsedJobData.skills || '',
            openings: parsedJobData.openings || '1'
          };
        } catch (jobDataError) {
          console.error("Error processing job data during fetch:", jobDataError);
        }
      }
      // Auto-create job data if this is a job listing but no job data exists
      else if (productData.catagory === "Jobs" || 
               (productData.subcatagory && productData.subcatagory.toLowerCase().includes("job"))) {
        console.log("Auto-creating job data for job listing");
        productData.jobData = {
          jobRole: productData.title || '',
          jobCategory: productData.subcatagory || '',
          companyName: productData.owner || '',
          positionType: 'Full-time',
          salaryPeriod: 'Monthly',
          salaryFrom: productData.price || '',
          salaryTo: '',
          educationRequired: 'Any',
          experienceRequired: 'Fresher',
          jobLocation: (productData.address && productData.address[0]) ? 
            `${productData.address[0].city}, ${productData.address[0].state}` : '',
          skills: '',
          openings: '1'
        };
      }
      
      setOwn(response.data.own);
      setData(productData);
      setLoading(false);
    } catch (error) {
      // when not logged in
      setOwn(false);
      try {
        const notLoggedInResponse = await axios.post(`${API_BASE_URL}/previewad/notloggedin/${id}`);
        const productData = notLoggedInResponse.data.product;
        
        // Apply the same job data processing for not logged in users
        if (productData.jobData) {
          try {
            let parsedJobData = productData.jobData;
            
            // If job data is a string, try to parse it
            if (typeof parsedJobData === 'string') {
              try {
                parsedJobData = JSON.parse(parsedJobData);
              } catch (parseError) {
                console.warn("Could not parse job data string:", parseError);
              }
            }
            
            // Ensure job data has all expected fields
            productData.jobData = {
              jobRole: parsedJobData.jobRole || productData.title || '',
              jobCategory: parsedJobData.jobCategory || productData.subcatagory || '',
              companyName: parsedJobData.companyName || productData.owner || '',
              positionType: parsedJobData.positionType || 'Full-time',
              salaryPeriod: parsedJobData.salaryPeriod || 'Monthly',
              salaryFrom: parsedJobData.salaryFrom || '',
              salaryTo: parsedJobData.salaryTo || '',
              educationRequired: parsedJobData.educationRequired || 'Any',
              experienceRequired: parsedJobData.experienceRequired || 'Fresher',
              jobLocation: parsedJobData.jobLocation || 
                (productData.address && productData.address[0] ? 
                  `${productData.address[0].city}, ${productData.address[0].state}` : ''),
              skills: parsedJobData.skills || '',
              openings: parsedJobData.openings || '1'
            };
          } catch (jobDataError) {
            console.error("Error processing job data during fetch:", jobDataError);
          }
        }
        // Auto-create job data if this is a job listing but no job data exists
        else if (productData.catagory === "Jobs" || 
                (productData.subcatagory && productData.subcatagory.toLowerCase().includes("job"))) {
          console.log("Auto-creating job data for job listing");
          productData.jobData = {
            jobRole: productData.title || '',
            jobCategory: productData.subcatagory || '',
            companyName: productData.owner || '',
            positionType: 'Full-time',
            salaryPeriod: 'Monthly',
            salaryFrom: productData.price || '',
            salaryTo: '',
            educationRequired: 'Any',
            experienceRequired: 'Fresher',
            jobLocation: (productData.address && productData.address[0]) ? 
              `${productData.address[0].city}, ${productData.address[0].state}` : '',
            skills: '',
            openings: '1'
          };
        }
        
        setData(productData);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setNotFound(true); 
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Also fetch debug data
    fetchDebugData();
  }, []);

  useEffect(() => {
    console.log("Full data:", data);
    console.log("Vehicle data:", data.vehicleData);
    console.log("Property data:", data.propertyData);
    console.log("Job data:", data.jobData);
    console.log("Property data type:", data.propertyData ? typeof data.propertyData : 'No property data');
    console.log("Job data type:", data.jobData ? typeof data.jobData : 'No job data');
    
    // Extract and normalize property data if it exists
    if (data && data.propertyData) {
      const normalizedPropertyData = extractPropertyData(data);
      
      if (Object.keys(normalizedPropertyData).length > 0) {
        console.log("Normalized property data:", normalizedPropertyData);
        
        // Only update if we have extracted valid property data
        setData(prevData => ({
          ...prevData,
          propertyData: normalizedPropertyData
        }));
      }
    }
  }, [data._id]); // Still trigger on data._id change for other data types

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!authToken || !id) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/wishlist/check/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setIsInWishlist(response.data.inWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    
    checkWishlistStatus();
  }, [authToken, id]);

  const handlePromoteClick = () => {
    onOpen();
  };

  const handlePromoteConfirm = async () => {
    try {
      console.log("Creating promotion order for product:", id);
      
      // Get the base API URL (works in both local and production environments)
      const apiBaseUrl = API_BASE_URL || 
                         window.location.origin.includes('localhost') ? 
                         'http://localhost:5000' : 
                         window.location.origin;
      
      console.log("Using API base URL:", apiBaseUrl);
      
      // If we're using client-side only integration (no server-side order creation)
      const useClientSideOnly = true; // Set this to true if you only have the key ID
      
      if (useClientSideOnly) {
        // Client-side only integration with just the key ID
        const options = {
          key: "rzp_live_FcuvdvTYCmLf7m", // Your Razorpay Key ID
          amount: 3000, // amount in paise (30 INR) - must be in paise (100 paise = 1 INR)
          currency: "INR",
          name: "RETREND",
          description: "Product Promotion Payment for 30 days",
          handler: async function (response) {
            console.log("Payment successful:", response);
            
            try {
              // Still call the backend to update the product status
              const verifyResponse = await axios.post(
                `${apiBaseUrl}/verify-promotion-payment-client`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  productId: id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );
              
              console.log("Payment status updated successfully:", verifyResponse.data);
              
              // Update local state
              setData({
                ...data,
                isPromoted: true,
                promotionStartDate: new Date(),
                promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              });
              
              toast({
                title: "Promotion Successful",
                description: "Your product will be displayed at the top with a 'Best One' label for 30 days.",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
              
              onClose();
            } catch (error) {
              console.error("Payment status update error:", error);
              
              // Even if server update fails, show success to user since payment was successful
              toast({
                title: "Payment Successful",
                description: "Your payment was successful, but there was an issue updating the product status. Please contact support if your product is not promoted soon.",
                status: "warning",
                duration: 7000,
                isClosable: true,
              });
              
              onClose();
            }
          },
          prefill: {
            name: data?.owner || "User",
            email: localStorage.getItem("userEmail") || "",
            contact: "" // Empty string allows user to enter their number
          },
          notes: {
            productId: id,
            productTitle: data.title
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: function() {
              console.log("Payment modal dismissed");
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment process.",
                status: "info",
                duration: 3000,
                isClosable: true,
              });
            },
            confirm_close: true, // Ask for confirmation when closing the modal
            escape: true, // Allow closing with ESC key
            animation: true // Enable animations
          },
        };
        
        console.log("Initializing Razorpay with client-side only options");
        
        // Initialize Razorpay
        try {
          await initializeRazorpay(options);
        } catch (error) {
          console.error("Razorpay initialization error:", error);
          toast({
            title: "Payment Failed",
            description: "Could not initialize payment gateway. Please try again later.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
        
        return;
      }
      
      // Server-side integration (requires both key ID and secret)
      // Create Razorpay order
      const orderResponse = await axios.post(
        `${apiBaseUrl}/create-promotion-order`,
        { productId: id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      console.log("Order created successfully:", orderResponse.data);
      
      const { orderId, amount, currency, keyId } = orderResponse.data;
      
      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "RETREND",
        description: "Product Promotion Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying payment:", response);
            
            // Verify payment with server
            const verifyResponse = await axios.post(
              `${apiBaseUrl}/verify-promotion-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                productId: id,
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            
            console.log("Payment verified successfully:", verifyResponse.data);
            
            // Update local state
            setData({
              ...data,
              isPromoted: true,
              promotionStartDate: new Date(),
              promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            
            toast({
              title: "Promotion Successful",
              description: "Your product will be displayed at the top with a 'Best One' label for 30 days.",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            
            onClose();
          } catch (error) {
            console.error("Payment verification error:", error);
            
            let errorMessage = "There was an issue verifying your payment. Please contact support.";
            
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
            
            toast({
              title: "Payment Verification Failed",
              description: errorMessage,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        prefill: {
          name: "User",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      };
      
      console.log("Initializing Razorpay with options:", { ...options, key: options.key.substring(0, 8) + '...' });
      
      // Initialize Razorpay
      try {
        await initializeRazorpay(options);
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        toast({
          title: "Payment Failed",
          description: "Could not initialize payment gateway. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      console.error("Promotion error:", error);
      toast({
        title: "Promotion Failed",
        description: "There was an issue creating the promotion order. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add new function to fetch debug data
  const fetchDebugData = async () => {
    try {
      setDebugLoading(true);
      const response = await axios.get(`${API_BASE_URL}/debug/product/${id}`);
      console.log("Debug data:", response.data);
      setDebugData(response.data);
      setDebugError(null);
      
      // If we received valid property data from debug API but not from the normal API,
      // update the main data with debug property data
      if (response.data.rawProduct && 
          response.data.rawProduct.propertyData && 
          (!data.propertyData || typeof data.propertyData === 'undefined')) {
        console.log("Updating data with property data from debug API");
        setData(prev => ({
          ...prev,
          propertyData: response.data.rawProduct.propertyData
        }));
      }

      // If we received valid job data from debug API but not from the normal API,
      // update the main data with debug job data
      if (response.data.rawProduct && 
          response.data.rawProduct.jobData && 
          (!data.jobData || typeof data.jobData === 'undefined')) {
        console.log("Updating data with job data from debug API");
        setData(prev => ({
          ...prev,
          jobData: response.data.rawProduct.jobData
        }));
      }
    } catch (error) {
      console.error("Error fetching debug data:", error);
      setDebugError(error.message);
    } finally {
      setDebugLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (NotFound) {
      return <NotFoundComponent />;
  }

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await axios.delete(`${API_BASE_URL}/myads_delete/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setIsRemoving(false);
      toast({
        title: "Ad Removed",
        description: "The ad has been successfully removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/myads");
    } catch (error) {
      console.error(error);
      setIsRemoving(false);
      toast({
        title: "Error",
        description: "There was an error removing the ad.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClick = async function(){
    if(auth){
     window.location.href = `/chat/${id}/${data.useremail}`
    }
    else{
    toggleShow();
    }
  }
  const address = data.address?.[0] || {};

  const ProductPics = Object.keys(data)
    .filter((key) => key.startsWith("productpic") && data[key])
    .map((key) => data[key]);

  const createdAt = new Date(data.createdAt);
  const now = new Date();
  // Calculate the time difference in milliseconds
  const timeDiff = now.getTime() - createdAt.getTime();
  // Convert milliseconds to days
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  const handleWishlistToggle = async () => {
    if (!authToken) {
      toggleShow(); // Show login modal if not logged in
      return;
    }

    try {
      setIsWishlistLoading(true);
      
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`${API_BASE_URL}/wishlist/remove/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add to wishlist
        await axios.post(
          `${API_BASE_URL}/wishlist/add`,
          { productId: id },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setIsInWishlist(true);
        toast({
          title: "Added to Wishlist",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Fix job data function
  const handleFixJobData = async () => {
    try {
      // Get the current auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to fix job data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Log info about the current data
      console.log("Current data:", data);
      console.log("Product ID:", id);

      // Create complete job data with all required fields
      const jobData = {
        jobRole: data.title || "",
        jobCategory: data.subcatagory || "",
        companyName: data.owner || "",
        positionType: "Full-time",
        salaryPeriod: "Monthly",
        salaryFrom: data.price || "",
        salaryTo: "",
        educationRequired: "Any",
        experienceRequired: "Fresher",
        jobLocation: (data.address && data.address[0]) 
          ? `${data.address[0].city}, ${data.address[0].state}` 
          : "",
        skills: "",
        openings: "1"
      };

      // If there's already some job data, preserve any existing non-empty values
      if (data.jobData) {
        const existingData = typeof data.jobData === 'string' 
          ? JSON.parse(data.jobData) 
          : data.jobData;
          
        // Only use existing values if they're not empty
        Object.keys(jobData).forEach(key => {
          if (existingData[key] && existingData[key].toString().trim() !== '') {
            jobData[key] = existingData[key];
          }
        });
      }

      console.log("Complete job data to be sent:", jobData);

      // Update the product with the job data using the existing endpoint
      const updateResponse = await axios.post(
        `${API_BASE_URL}/updateproduct/${id}`,
        {
          jobData: jobData // Send the object directly
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", updateResponse.data);

      toast({
        title: "Job data fixed",
        description: "The job data has been updated. Refreshing...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error("Error fixing job data:", err);
      toast({
        title: "Error",
        description: "Failed to fix job data: " + (err.response?.data?.message || err.message || "An error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add a new section to display debug data in the UI
  const renderDebugSection = () => {
    if (debugLoading) {
      return <Text>Loading debug data...</Text>;
    }
    
    if (debugError) {
      return <Text color="red.500">Error loading debug data: {debugError}</Text>;
    }
    
    if (!debugData) {
      return <Text>No debug data available</Text>;
    }
    
    // Create diagnostics for job data
    const jobDataType = data.jobData ? typeof data.jobData : 'undefined';
    const jobDataExists = !!data.jobData;
    const jobDataKeys = data.jobData ? Object.keys(data.jobData) : [];
    const jobDataStringified = data.jobData ? JSON.stringify(data.jobData, null, 2) : 'null';
    
    return (
      <Box border="1px" borderColor="red.200" p={4} borderRadius="md" bg="red.50">
        <Heading size="sm" color="red.500">Detailed Debug Information</Heading>
        <Text fontSize="xs" mt={2}>Database ID: {debugData.diagnostics.databaseId}</Text>
        
        <Divider my={2} />
        
        <Heading size="xs" color="red.500" mt={3}>Property Data</Heading>
        <Text fontSize="xs">Property Data Exists: {debugData.diagnostics.propertyDataExists ? 'Yes' : 'No'}</Text>
        <Text fontSize="xs">Property Data Type: {debugData.diagnostics.propertyDataType}</Text>
        <Text fontSize="xs">Property Data Keys: {debugData.diagnostics.propertyDataKeys.join(', ') || 'None'}</Text>
        
        <Heading size="xs" mt={3} mb={1}>Raw Property Data:</Heading>
        <Box 
          as="pre" 
          fontSize="2xs" 
          p={2} 
          bg="white" 
          borderRadius="sm" 
          maxHeight="200px" 
          overflowY="auto"
          whiteSpace="pre-wrap"
        >
          {debugData.diagnostics.propertyDataStringified || 'null'}
        </Box>
        
        <Divider my={2} />
        
        <Heading size="xs" color="red.500" mt={3}>Job Data</Heading>
        <Text fontSize="xs">Job Data Exists: {jobDataExists ? 'Yes' : 'No'}</Text>
        <Text fontSize="xs">Job Data Type: {jobDataType}</Text>
        <Text fontSize="xs">Job Data Keys: {jobDataKeys.join(', ') || 'None'}</Text>
        
        <Heading size="xs" mt={3} mb={1}>Raw Job Data:</Heading>
        <Box 
          as="pre" 
          fontSize="2xs" 
          p={2} 
          bg="white" 
          borderRadius="sm" 
          maxHeight="200px" 
          overflowY="auto"
          whiteSpace="pre-wrap"
        >
          {jobDataStringified || 'null'}
        </Box>
        
        <Button 
          size="xs" 
          colorScheme="red" 
          mt={3}
          onClick={() => {
            // If we have property data in debug response, try to update the main state
            if (debugData.rawProduct && debugData.rawProduct.propertyData) {
              setData(prev => ({
                ...prev,
                propertyData: debugData.rawProduct.propertyData
              }));
              toast({
                title: "Data updated",
                description: "Property data updated from debug info",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }
            
            // If we have job data in debug response, try to update the main state
            if (debugData.rawProduct && debugData.rawProduct.jobData) {
              setData(prev => ({
                ...prev,
                jobData: debugData.rawProduct.jobData
              }));
              toast({
                title: "Data updated",
                description: "Job data updated from debug info",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }
          }}
        >
          Try to fix with debug data
        </Button>
      </Box>
    );
  };

  return (
    <div>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        className="mt-3 ms-3"
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={`/catagory/${data.catagory}`}>
            {data.catagory}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{data.subcatagory}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <MDBRow className="mt-3 mb-3">
        <MDBCol md="8">
          <Card>
            <CardBody>
              <Carousel>
                {data.productpic1 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic1}
                      alt="First slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
                {data.productpic2 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic2}
                      alt="Second slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
                {data.productpic3 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic3}
                      alt="Third slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
              </Carousel>
            </CardBody>
          </Card>
          <Card className="mt-3">
            <CardHeader>
              <Heading size="md">Details</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<Divider />} spacing="4">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Price
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    <CurrencyRupeeTwoToneIcon />
                    {data.price}
                    {data.isPromoted && (
                      <Badge colorScheme="green" ml={2} className="best-one-badge">
                        Best One
                      </Badge>
                    )}
                    {data.isGoodForBestOne && (
                      <Badge colorScheme="blue" ml={2} className="good-for-best-one-badge">
                        Good for the best one
                      </Badge>
                    )}
                  </Text>
                </Box>
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Description
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {data.description}
                  </Text>
                </Box>
                {/* Vehicle Details Section */}
                {data.vehicleData && (
                  <Box 
                    padding="20px"
                    backgroundColor="#f8f9fa"
                    borderRadius="8px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.05)"
                    marginTop="20px"
                    marginBottom="20px"
                  >
                    <Heading size="md" mb={4}>
                      {data.vehicleData.vehicleType === 'car' ? 'Car' : 'Bike'} Details
                    </Heading>
                    
                    <Grid 
                      templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                      gap="16px"
                      marginTop="20px"
                    >
                      {/* Full width item for Brand and Model */}
                      <Box
                        backgroundColor="white"
                        borderRadius="6px"
                        padding="15px"
                        boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                        transition="all 0.3s ease"
                        gridColumn="1 / -1"
                        className="hover-effect"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                      >
                        <Text fontWeight="600" color="#666" fontSize="0.9rem">
                          {data.vehicleData.vehicleType === 'car' ? 'Car' : 'Bike'} Model
                        </Text>
                        <Text mt={2} fontSize="xl" fontWeight="bold">
                          {data.vehicleData.brand} {data.vehicleData.model}
                        </Text>
                      </Box>
                      
                      {/* Regular grid items */}
                      {data.vehicleData.year && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Year</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.year}</Text>
                        </Box>
                      )}
                      
                        {data.vehicleData.fuelType && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Fuel Type</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">
                            {data.vehicleData.fuelType.charAt(0).toUpperCase() + data.vehicleData.fuelType.slice(1)}
                          </Text>
                        </Box>
                      )}
                      
                      {data.vehicleData.kmDriven && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">KM Driven</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.kmDriven}</Text>
                        </Box>
                      )}
                      
                        {data.vehicleData.ownership && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Ownership</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.ownership} owner</Text>
                        </Box>
                      )}
                      
                        {data.vehicleData.color && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Color</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.color}</Text>
                        </Box>
                      )}
                      
                        {data.vehicleData.registrationPlace && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Registration</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.registrationPlace}</Text>
                        </Box>
                      )}
                      
                        {data.vehicleData.insurance && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="10px 15px"
                          display="flex"
                          justifyContent="space-between"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem">Insurance</Text>
                          <Text fontWeight="500" color="#333" textAlign="right">{data.vehicleData.insurance}</Text>
                        </Box>
                      )}
                        
                      {/* Features section */}
                      {data.vehicleData.features && (
                        <Box
                          backgroundColor="white"
                          borderRadius="6px"
                          padding="15px"
                          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                          transition="all 0.3s ease"
                          gridColumn="1 / -1"
                          className="hover-effect"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <Text fontWeight="600" color="#666" fontSize="0.9rem" mb={2}>
                            Additional Features
                          </Text>
                          
                          <Flex wrap="wrap" mt={2} gap={2}>
                            {/* Always show for both cars and bikes */}
                            {data.vehicleData.features.abs && (
                              <Badge colorScheme="blue" p={2} borderRadius="md">ABS</Badge>
                            )}
                            {data.vehicleData.features.alloyWheels && (
                              <Badge colorScheme="blue" p={2} borderRadius="md">Alloy Wheels</Badge>
                            )}
                            {data.vehicleData.features.bluetooth && (
                              <Badge colorScheme="blue" p={2} borderRadius="md">Bluetooth</Badge>
                            )}
                            
                            {/* Car-specific features */}
                            {data.vehicleData.vehicleType === 'car' && (
                              <>
                                {data.vehicleData.features.adjustableMirror && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Adjustable Mirrors</Badge>
                                )}
                                {data.vehicleData.features.adjustableSteering && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Adjustable Steering</Badge>
                                )}
                                {data.vehicleData.features.airConditioning && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Air Conditioning</Badge>
                                )}
                                {data.vehicleData.features.cruiseControl && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Cruise Control</Badge>
                                )}
                                {data.vehicleData.features.parkingSensors && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Parking Sensors</Badge>
                                )}
                                {data.vehicleData.features.powerSteering && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Power Steering</Badge>
                                )}
                                {data.vehicleData.features.powerWindows && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Power Windows</Badge>
                                )}
                                {data.vehicleData.features.rearCamera && (
                                  <Badge colorScheme="blue" p={2} borderRadius="md">Rear Camera</Badge>
                                )}
                              </>
                            )}
                            
                            {/* Display if vehicle is accidental */}
                            {data.vehicleData.features.accidental && (
                              <Badge colorScheme="red" p={2} borderRadius="md">Accidental</Badge>
                            )}
                            
                            {/* Display airbags if available */}
                            {data.vehicleData.features.airbags && data.vehicleData.features.airbags !== "0" && (
                              <Badge colorScheme="blue" p={2} borderRadius="md">{data.vehicleData.features.airbags} Airbags</Badge>
                            )}
                            
                            {/* Display message if no features selected */}
                            {!data.vehicleData.features.abs && 
                             !data.vehicleData.features.alloyWheels && 
                             !data.vehicleData.features.bluetooth && 
                             !data.vehicleData.features.adjustableMirror && 
                             !data.vehicleData.features.adjustableSteering && 
                             !data.vehicleData.features.airConditioning && 
                             !data.vehicleData.features.cruiseControl && 
                             !data.vehicleData.features.parkingSensors && 
                             !data.vehicleData.features.powerSteering && 
                             !data.vehicleData.features.powerWindows && 
                             !data.vehicleData.features.rearCamera && (
                              <Text mt={2}>No additional features specified</Text>
                            )}
                          </Flex>
                        </Box>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {/* Category Data Section */}
                {data.categoryData && Object.keys(data.categoryData).length > 0 && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      {data.categoryData.type === "book" ? "BOOK DETAILS" : 
                       data.categoryData.type === "electronics" ? "ELECTRONICS DETAILS" :
                       data.categoryData.type === "furniture" ? "FURNITURE DETAILS" :
                       data.categoryData.type === "property" ? "PROPERTY DETAILS" :
                       data.categoryData.type === "mobile" ? "MOBILE DETAILS" :
                       data.categoryData.type === "fashion" ? "FASHION DETAILS" :
                       data.categoryData.type === "job" ? "JOB DETAILS" :
                       data.categoryData.type === "sports_hobbies" ? "SPORTS & HOBBIES DETAILS" :
                       data.categoryData.type === "pet" ? "PET DETAILS" : "DETAILS"}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      <div className="row">
                        {/* Dynamic display of category-specific fields */}
                        {Object.entries(data.categoryData).map(([key, value]) => {
                          // Skip the type field since we use it for the heading
                          if (key === 'type') return null;
                          
                          // Format the key for display
                          const formattedKey = key.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/([a-z])([A-Z])/g, '$1 $2');
                          
                          // Format boolean values
                          let displayValue = value;
                          if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                          }
                          
                          return (
                            <div className="col-md-6 mb-2" key={key}>
                              <span className="text-muted">{formattedKey}: </span>
                              <span>{displayValue}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Text>
                  </Box>
                )}
                
                {/* Property Data Section */}
                {data && data.propertyData && (
                  <PropertyDetailsDisplay propertyData={data.propertyData} />
                )}
                
                {/* Mobile Data Section */}
                {data && data.categoryData && data.categoryData.type === "mobile" && (
                  <MobileDetailsDisplay mobileData={data.categoryData} />
                )}
                
                {/* Job Data Section */}
                {data && data.jobData ? (
                  <JobDetailsDisplay jobData={data.jobData} />
                ) : (
                  // No job data at all
                  data.catagory === "Jobs" || (data.subcatagory && data.subcatagory.toLowerCase().includes("job")) ? (
                    <Box 
                      padding="4" 
                      bg="yellow.50" 
                      borderRadius="md" 
                      borderWidth="1px" 
                      borderColor="yellow.200"
                      mt="4"
                    >
                      <Text color="yellow.700">
                        Job details are not available. Please try refreshing the page or contact support.
                      </Text>
                      <Button 
                        mt="2" 
                        size="sm" 
                        colorScheme="yellow" 
                        onClick={handleFixJobData}
                      >
                        Try to fix data
                      </Button>
                    </Box>
                  ) : null
                )}
              </Stack>
            </CardBody>
          </Card>
        </MDBCol>
        <MDBCol md="4">
          <Card>
            <CardHeader>
              <Heading size="md">Seller Information</Heading>
            </CardHeader>
            <CardBody>
              <Flex>
                <Image
                  borderRadius="full"
                  boxSize="50px"
                  src={data.ownerpicture}
                  alt={data.owner}
                  mr="12px"
                />
                <Stack>
                  <Heading size="sm">{data.owner}</Heading>
                  <Text>Member since 2023</Text>
                </Stack>
              </Flex>
            </CardBody>
            <CardFooter>
              {own ? (
                <Flex width="100%" justifyContent="space-between">
                  <Button
                    colorScheme="red"
                    onClick={handleRemove}
                    isLoading={isRemoving}
                  >
                    Remove Ad
                  </Button>
                  {!data.isPromoted && (
                    <Button
                      colorScheme="green"
                      onClick={handlePromoteClick}
                    >
                      Promote Ad
                    </Button>
                  )}
                </Flex>
              ) : (
                <Flex width="100%" justifyContent="space-between">
                  <Button
                    colorScheme="blue"
                    width="60%"
                    onClick={authToken ? handleClick : toggleShow}
                  >
                    Chat with Seller
                  </Button>
                  <ShareProduct productId={id} title={data.title} />
                  <Button
                    variant="solid"
                    size="md"
                    colorScheme={isInWishlist ? "red" : "pink"}
                    onClick={handleWishlistToggle}
                    isLoading={isWishlistLoading}
                    width="15%"
                  >
                    {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </Button>
                </Flex>
              )}
            </CardFooter>
          </Card>
          <Card className="mt-3">
            <CardHeader>
              <Heading size="md">Posted in</Heading>
            </CardHeader>
            <CardBody>
              <Text>
                {data.address && data.address[0] && data.address[0].area},{" "}
                {data.address && data.address[0] && data.address[0].city},{" "}
                {data.address && data.address[0] && data.address[0].state},{" "}
                {data.address && data.address[0] && data.address[0].postcode}
              </Text>
              <MapComponent 
                location={{
                  lat: data.latitude || (data.address && data.address[0] ? data.address[0].latitude : null),
                  lng: data.longitude || (data.address && data.address[0] ? data.address[0].longitude : null)
                }} 
              />
            </CardBody>
          </Card>
        </MDBCol>
      </MDBRow>

      {/* Promotion Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Promote Your Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Promote your product for ₹30 to make it appear at the top of search results with a "Best One" label for 30 days.
            </Text>
            <Box p={4} borderWidth="1px" borderRadius="lg">
              <Text fontWeight="bold">{data.title}</Text>
              <Text>Price: ₹{data.price}</Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handlePromoteConfirm}>
              Pay ₹30
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {staticModal && <Modallogin toggleShow={toggleShow} />}
    </div>
  );
};

export default PreviewAd;
