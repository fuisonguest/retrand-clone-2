import React, { useEffect, useState, useRef } from "react";
import "./mychat.css";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCardImage,
  MDBTypography,
} from "mdb-react-ui-kit";
import CatNavbar from "./CatNavbar";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
  Box,
  useMediaQuery,
} from "@chakra-ui/react";
import {
  CloseIcon,
  DeleteIcon,
  HamburgerIcon,
  ViewIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import ForumIcon from "@mui/icons-material/Forum";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import Inbox from "./ChatComponents/Inbox";
import FetchChat from "./ChatComponents/FetchChat";
import SendChat from "./ChatComponents/SendChat";
import Loading from "./resources/Loading";

export default function MyChat({ mobileView }) {
  const { id, useremail } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const authemail = localStorage.getItem("authemail");
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const messageEndRef = useRef(null);

  const [product, setProduct] = useState({});
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [ChatScreen, setChatScreen] = useState(false);

  // Auto-scroll to the bottom of messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ChatScreen]);

  useEffect(() => {
    if (id && useremail) {
      const fetchData = async () => {
        setChatScreen(true);
        try {
          const response = await axios.post(
            `http://localhost:5000/previewad/${id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          setProduct(response.data.product);
          setIsLoading(false); // Set loading state to false when data is fetched successfully
        } catch (error) {
          setChatScreen(false);
        }
      };
      fetchData();
      if (useremail === authemail) {
        setChatScreen(false);
      } else {
        setChatScreen(true);
        try{
          axios
            .get(`http://localhost:5000/profilesearch?useremail=${useremail}`)
            .then((response) => {
              setProfileData(response.data);
              setIsLoading(false);
            })
            .catch((error) => {
              setIsLoading(false);
              setChatScreen(false);
            });
          }
          catch{
            setChatScreen(false);
          }
      }

    } else {
      setIsLoading(false);
    }
  }, [id, useremail, authToken, product.useremail]);

  if (isLoading) {
    return <Loading />;
  }

  const handleDelete = () => {
    setIsLoading(true);
    axios
      .post(
        `http://localhost:5000/deletechat/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        setChatScreen(false);
        toast({
          title: "Chat Deleted",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        if (mobileView) {
          navigate('/chat');
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: "No Chats Found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleBack = () => {
    if (mobileView) {
      navigate('/chat');
    } else {
      setChatScreen(false);
    }
  };

  // Mobile view when accessed directly from /mobilechat/:id/:useremail
  if (mobileView || (isMobile && ChatScreen)) {
    return (
      <>
        <CatNavbar />
        <Box className="mobile-chat-container">
          <Card>
            <CardBody style={{ display: "flex", alignItems: "center" }}>
              <Button className="mx-2" onClick={handleBack}>
                <ArrowBackIcon />
              </Button>
              <Link
                to={`/profile/${useremail}`}
                style={{ display: "flex", alignItems: "center", flexGrow: 1 }}
              >
                <AvatarGroup>
                  <Image
                    boxSize="50px"
                    objectFit="cover"
                    src={product.productpic1}
                    alt="Product Image"
                  />
                  <MDBCardImage
                    className="img-fluid rounded-circle border border-dark border-2"
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                    src={product.ownerpicture}
                    alt="Product Owner"
                    fluid
                  />
                </AvatarGroup>
                <Box ml={4}>
                  <Heading size="md">{profileData.name}</Heading>
                </Box>
                <Avatar
                  src={profileData.picture}
                  alt="Message To"
                  size="sm"
                  className="mx-2"
                />
              </Link>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<HamburgerIcon />}
                  variant="outline"
                />
                <MenuList>
                  <MenuItem
                    icon={<DeleteIcon color="red.500" />}
                    command="⌘"
                    onClick={handleDelete}
                  >
                    Delete Chat
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    to={`/preview_ad/${id}`}
                    icon={<ViewIcon color="green.500" />}
                    command="->"
                  >
                    See Product
                  </MenuItem>
                </MenuList>
              </Menu>
            </CardBody>
            <Container style={{ display: "flex", alignItems: "center" }}>
              <p style={{ marginRight: "auto" }}>
                Title: {product.title}
              </p>
              <p>
                Price: <CurrencyRupeeIcon fontSize="small" />
                {product.price}
              </p>
            </Container>
          </Card>
          <Divider />
          <Box className="mobile-messages-container">
            <MDBTypography listUnStyled>
              <FetchChat id={id} toData={profileData} to={useremail} />
              <div ref={messageEndRef} />
            </MDBTypography>
          </Box>
          <Box className="mobile-chat-input">
            <SendChat id={id} to={useremail} />
          </Box>
        </Box>
      </>
    );
  }

  // Regular desktop or tablet view
  return (
    <>
      <CatNavbar />
      <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee" }}>
        <MDBRow>
          <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
            <Inbox />
          </MDBCol>

          <MDBCol md="6" lg="7" xl="8">
            {ChatScreen ? (
              <>
                <Card>
                  <CardBody style={{ display: "flex", alignItems: "center" }}>
                    <Link
                      to={`/profile/${useremail}`}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <AvatarGroup>
                        <Image
                          boxSize="50px"
                          objectFit="cover"
                          src={product.productpic1}
                          alt="Poduct Image"
                        />
                        <MDBCardImage
                          className="img-fluid rounded-circle border border-dark border-2"
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                          src={product.ownerpicture}
                          alt="Product Owner"
                          fluid
                        />
                      </AvatarGroup>
                      <div style={{ marginLeft: "1rem" }}>
                        <Heading size="md">{profileData.name}</Heading>
                      </div>
                      <Avatar
                        src={profileData.picture}
                        alt="Message To"
                        size="sm"
                        className="mx-2"
                      />
                    </Link>
                    <div style={{ flexGrow: 1 }}></div>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<HamburgerIcon />}
                        variant="outline"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<DeleteIcon color="red.500" />}
                          command="⌘"
                          onClick={handleDelete}
                        >
                          Delete Chat
                        </MenuItem>
                        <MenuItem
                          as={Link}
                          to={`/preview_ad/${id}`}
                          icon={<ViewIcon color="green.500" />}
                          command="->"
                        >
                          See Product
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    <Button
                      className="mx-2"
                      onClick={() => {
                        setChatScreen(false);
                      }}
                    >
                      <CloseIcon />
                    </Button>
                  </CardBody>
                  <Container style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ marginRight: "auto" }}>
                      Title: {product.title}
                    </p>
                    <p>
                      Price: <CurrencyRupeeIcon fontSize="small" />
                      {product.price}
                    </p>
                  </Container>
                </Card>
                <Divider />
                <Box className="desktop-messages-container">
                  <MDBTypography listUnStyled>
                    <FetchChat id={id} toData={profileData} to={useremail} />
                    <div ref={messageEndRef} />
                  </MDBTypography>
                </Box>
                <SendChat id={id} to={useremail} />
              </>
            ) : (
              <>
                <Flex
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  minH="60vh"
                >
                  <ForumIcon style={{ color: "teal", fontSize: "60px" }} />
                  <b>Select a Chat to View Conversation</b>
                </Flex>
              </>
            )}
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </>
  );
}
