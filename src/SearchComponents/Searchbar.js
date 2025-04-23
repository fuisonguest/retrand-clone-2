import React, { useState } from 'react';
import { MDBBtn, MDBIcon, MDBInputGroup } from 'mdb-react-ui-kit';
import { Box, Flex } from '@chakra-ui/react';

export default function Searchbar() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    const newUrl = `/results?query=${encodeURIComponent(input)}`;
    window.location.href = newUrl;
  }

  return (
    <Box 
      className="search-container w-100"
      maxWidth="600px"
    >
      <MDBInputGroup 
        tag='form' 
        onSubmit={onSubmit} 
        className={`mx-3 my-1 ${isFocused ? 'focused-search' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          transform: isFocused ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <Flex 
          position="relative" 
          width="100%"
          borderRadius="8px"
          boxShadow={isFocused ? '0 0 0 2px #3498db, 0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.08)'}
          transition="all 0.3s ease"
          bg="white"
          overflow="hidden"
        >
          <input
            className="form-control"
            placeholder="Find Cars, Mobile Phones, and more..."
            aria-label="Search"
            type="search"
            value={input}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ 
              border: 'none',
              borderTopLeftRadius: "8px", 
              borderBottomLeftRadius: "8px",
              padding: "12px 15px",
              fontSize: "15px",
              fontWeight: "500",
              flex: "1",
              color: "#333",
              backgroundColor: "white",
              boxShadow: "none",
              outline: "none"
            }}
          />
          <MDBBtn 
            rippleColor='light' 
            className="search-button"
            style={{
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              padding: "10px 20px",
              backgroundColor: "#3498db",
              borderColor: "#3498db",
              boxShadow: "none",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2980b9";
              e.currentTarget.style.borderColor = "#2980b9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#3498db";
              e.currentTarget.style.borderColor = "#3498db";
            }}
          >
            <MDBIcon 
              icon='search' 
              size="lg" 
              style={{ marginRight: "0px" }} 
            />
          </MDBBtn>
        </Flex>
      </MDBInputGroup>
      
      {/* Add some custom CSS for the search container */}
      <style jsx global>{`
        .focused-search {
          z-index: 10;
        }
        
        .form-control:focus {
          box-shadow: none !important;
          border-color: transparent !important;
        }
        
        .search-button:hover {
          filter: brightness(0.95);
        }
        
        @media (max-width: 768px) {
          .search-container {
            width: 100% !important;
          }
        }
      `}</style>
    </Box>
  );
}
