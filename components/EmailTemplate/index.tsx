export default function EmailTemplate({ email, confirmationUrl }: { email: string, confirmationUrl: string }) {
  
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to LunaDrone</title>
        <style>
          {`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #4a4a4a;
              background-color: #f5f3f0;
              margin: 0;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fef9f3;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
              overflow: hidden;
              border: 1px solid #f0e6d6;
            }
            
            .header {
              background-color: #fef9f3;
              padding: 50px 30px 40px;
              text-align: center;
              position: relative;
            }
            
            .header h1 {
              color: #2d2d2d;
              font-size: 32px;
              font-weight: 600;
              margin-bottom: 12px;
            }
            
            .header .subtitle {
              color: #666666;
              font-size: 16px;
              font-weight: 400;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .welcome-message {
              font-size: 18px;
              color: #4a4a4a;
              margin-bottom: 24px;
              text-align: center;
            }
            
            .features {
              background-color: #f8f5f0;
              border-radius: 12px;
              padding: 28px;
              margin: 28px 0;
              border: 1px solid #f0e6d6;
            }
            
            .features h3 {
              color: #2d2d2d;
              font-size: 20px;
              margin-bottom: 18px;
              text-align: center;
              font-weight: 600;
            }
            
            .feature-list {
              list-style: none;
              padding: 0;
            }
            
            .feature-list li {
              padding: 10px 0;
              color: #555555;
              position: relative;
              padding-left: 28px;
              font-size: 15px;
            }
            
            .feature-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #f97316;
              font-weight: bold;
              font-size: 16px;
            }
            
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            
            .cta-button {
              display: inline-block;
              background-color: #f97316;
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
            }
            
            .cta-button:hover {
              background-color: #ea580c;
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(249, 115, 22, 0.35);
            }
            
            .footer {
              background-color: #f8f5f0;
              padding: 28px 30px;
              text-align: center;
              border-top: 1px solid #f0e6d6;
            }
            
            .footer p {
              color: #666666;
              font-size: 14px;
              margin-bottom: 12px;
            }
            
            .unsubscribe-link {
              color: #f97316;
              text-decoration: none;
              font-weight: 500;
            }
            
            .unsubscribe-link:hover {
              text-decoration: underline;
              color: #ea580c;
            }
            
            .logo {
              width: 60px;
              height: 60px;
              background-color: #f97316;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
            }
            
            /* Mobile responsiveness */
            @media only screen and (max-width: 600px) {
              body {
                padding: 10px;
              }
              
              .header {
                padding: 30px 20px;
              }
              
              .header h1 {
                font-size: 28px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .footer {
                padding: 20px;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="email-container">
          <div className="header">

            <h1>Stay Updated with <span style={{color: '#f97316'}}>Luna</span></h1>
            <p className="subtitle">Your journey into the future of flight begins now</p>
          </div>
          
          <div className="content">
            <p className="welcome-message">
              Hello there! We&lsquo;re thrilled to have you join our community of drone enthusiasts and innovators.
            </p>
            
            <div className="features">
              <h3>What you can expect from us:</h3>
              <ul className="feature-list">
                <li>Latest drone technology updates and reviews</li>
                <li>Exclusive deals and early access to new products</li>
                <li>Tips and tutorials from expert pilots</li>
                <li>Community events and flying meetups</li>
              </ul>
            </div>
            
            <div className="cta-section">
              <a href="https://www.lunadrone.com/" className="cta-button">
                Get Started Today
              </a>
            </div>
          </div>
          
          <div className="footer">
            <p>
              You&lsquo;re receiving this email because you subscribed to our newsletter at{' '}
              <strong>lunadrone.com</strong> as {email}
            </p>
            <p>
              If this wasn&lsquo;t you, you can{' '}
              <a 
                href={confirmationUrl}
                className="unsubscribe-link"
              >
                unsubscribe here
              </a>
            </p>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#a0aec0' }}>
              © 2025 LunaDrone. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

export  function EmailVerificationTemplate({ 
 
  username, 
  confirmationUrl 
}: { 
 
  username: string;
  confirmationUrl: string;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <head>
        <meta charSet="UTF-8" />
        <title>Confirm Sign Up - Luna</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <table 
        // maxWidth="600"
          width="100%" 
          cellSpacing="0" 
          cellPadding="0" 
          style={{ backgroundColor: '#ffffff', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse' }}
        >
          {/* Header with Logo */}
          <tr>
            <td 
              align="center" 
              style={{
                padding: '20px 0',
                backgroundColor: '#2c3e50'
              }}
            >
              <img 
                src="https://lunadrone.com/icon1.png" 
                alt="Luna Logo" 
                width="40" 
                height="40" 
              />
            </td>
          </tr>
          
          {/* Main Content */}
          <tr>
            <td 
              align="center" 
              style={{ padding: '40px 20px' }}
            >
              <h1 style={{
                fontSize: '24px',
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                Confirm your email
              </h1>
              
              <p style={{
                fontSize: '16px',
                marginBottom: '30px',
                margin: '0 0 30px 0',
                textTransform: 'capitalize',
              }}>
                Hi <strong>{username}</strong>,
              </p>
              
              <p style={{
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 30px',
                lineHeight: '1.5'
              }}>
                Someone created this accout with this email. Please authorize this action by clicking the link below. The link will expire in 24 hours.
              </p>
              
              <a 
                href={confirmationUrl}
                style={{
                  display: 'inline-block',
                  marginTop: '30px',
                  padding: '14px 32px',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  borderRadius: '30px'
                }}
              >
                Confirm email
              </a>
              
              <p style={{
                marginTop: '30px',
                fontSize: '14px',
                color: '#555',
                margin: '30px 0 0 0'
              }}>
                If you cannot open the link, copy and paste the URL below into your browser:
                <p
                   
                  style={{ color: '#007bff' }}
                >
                  {confirmationUrl}
                </p>
                
              </p>
            </td>
          </tr>
          
          {/* Footer */}
          <tr>
            <td 
              align="center" 
              style={{
                backgroundColor: '#f1f1f1',
                padding: '30px 20px'
              }}
            >
              <p style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>
                Luna Inc. Nairobi, Kenya
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#888',
                margin: '0'
              }}>
                <a 
                  href="https://lunadrone.com/privacy-policy" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Privacy Policy
                </a>
                {' | '}
                <a 
                  href="https://lunadrone.com/terms-and-conditions" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Terms of Service
                </a>
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#aaa',
                marginTop: '10px',
                margin: '10px 0 0 0'
              }}>
                © 2025 Luna Inc.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

export  function ResetPasswordEmailTemplate({ 
  
  username, 
  resetUrl 
}: { 
  
  username: string;
  resetUrl: string;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <head>
        <meta charSet="UTF-8" />
        <title>Reset Your Password - Luna</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <table 
          width="100%" 
          cellSpacing="0" 
          cellPadding="0" 
         style={{ backgroundColor: '#ffffff', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse' }}
        >
          {/* Header with Logo */}
          <tr>
            <td 
              align="center" 
              style={{
                padding: '20px 0',
                backgroundColor: '#2c3e50'
              }}
            >
            <img 
                src="https://lunadrone.com/icon1.png" 
                alt="Luna Logo" 
                width="40" 
                height="40" 
              />
            </td>
          </tr>
          
          {/* Main Content */}
          <tr>
            <td 
              align="center" 
              style={{ padding: '40px 20px' }}
            >
              <h1 style={{
                fontSize: '24px',
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                Reset your password
              </h1>
              
              <p style={{
                fontSize: '16px',
                marginBottom: '30px',
                margin: '0 0 30px 0'
              }}>
                Hi <strong>{username}</strong>,
              </p>
              
              <p style={{
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 30px',
                lineHeight: '1.5'
              }}>
                We received a request to reset your password for your Luna account. Click the button below to create a new password. This link will expire in 24 hours for security reasons.
              </p>
              
              <a 
                href={resetUrl}
                style={{
                  display: 'inline-block',
                  marginTop: '30px',
                  padding: '14px 32px',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  borderRadius: '30px'
                }}
              >
                Reset password
              </a>
              
              <p style={{
                marginTop: '30px',
                fontSize: '14px',
                color: '#555',
                margin: '30px 0 0 0',
                maxWidth: '500px',
                lineHeight: '1.5'
              }}>
                If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged. If you&apos;re concerned about your account security, please{' '}
                <a 
                  href="https://lunadrone.com/support" 
                  style={{ color: '#007bff' }}
                >
                  contact our support team
                </a>.
              </p>
            </td>
          </tr>
          
          {/* Footer */}
          <tr>
            <td 
              align="center" 
              style={{
                backgroundColor: '#f1f1f1',
                padding: '30px 20px'
              }}
            >
              <p style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>
                Luna Inc., Nairobi, Kenya
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#888',
                margin: '0'
              }}>
                <a 
                  href="https://lunadrone.com/privacy-policy" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Privacy Policy
                </a>
                {' | '}
                <a 
                  href="https://lunadrone.com/terms-and-conditions" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Terms of Service
                </a>
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#aaa',
                marginTop: '10px',
                margin: '10px 0 0 0'
              }}>
                © 2025 Luna Inc.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
export function PasswordResetSuccessTemplate({ 
  username 
}: { 
  username: string;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <head>
        <meta charSet="UTF-8" />
        <title>Password Changed Successfully - Luna</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <table 
          width="100%" 
          cellSpacing="0" 
          cellPadding="0" 
         style={{ backgroundColor: '#ffffff', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse' }}
        >
          {/* Header with Logo */}
          <tr>
            <td 
              align="center" 
              style={{
                padding: '20px 0',
                backgroundColor: '#2c3e50'
              }}
            >
            <img 
                src="https://lunadrone.com/icon1.png" 
                alt="Luna Logo" 
                width="40" 
                height="40" 
              />
            </td>
          </tr>
          
          {/* Main Content */}
          <tr>
            <td 
              align="center" 
              style={{ padding: '40px 20px' }}
            >
              {/* Success Icon */}
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  ✓
                </span>
              </div>
              
              <h1 style={{
                fontSize: '24px',
                marginBottom: '20px',
                margin: '0 0 20px 0',
                color: '#28a745'
              }}>
                Password Successfully Changed
              </h1>
              
              <p style={{
                fontSize: '16px',
                marginBottom: '30px',
                margin: '0 0 30px 0',
                textTransform: 'capitalize',
              }}>
                Hi <strong>{username}</strong>,
              </p>
              
              <p style={{
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 30px',
                lineHeight: '1.5'
              }}>
                Your Luna account password has been successfully changed. You can now use your new password to sign in to your account.
              </p>
              
              <a 
                href="https://lunadrone.com/auth/login"
                style={{
                  display: 'inline-block',
                  marginTop: '30px',
                  padding: '14px 32px',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  borderRadius: '30px'
                }}
              >
                Sign In Now
              </a>
              
              <p style={{
                marginTop: '30px',
                fontSize: '14px',
                color: '#555',
                margin: '30px 0 0 0',
                maxWidth: '500px',
                lineHeight: '1.5'
              }}>
                If you didn&apos;t make this change, please{' '}
                <a 
                  href="https://lunadrone.com/support" 
                  style={{ color: '#007bff' }}
                >
                  contact our support team
                </a>{' '}
                immediately as your account may have been compromised.
              </p>
              
              <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                maxWidth: '500px',
                margin: '40px auto 0'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  margin: '0 0 10px 0',
                  color: '#333'
                }}>
                  Security Tips:
                </h3>
                <ul style={{
                  fontSize: '12px',
                  color: '#666',
                  margin: '0',
                  paddingLeft: '20px',
                  lineHeight: '1.4'
                }}>
                  <li>Keep your password secure and don&apos;t share it with anyone</li>
                  <li>Use a unique password for your Luna account</li>
                  <li>Consider enabling two-factor authentication for added security</li>
                </ul>
              </div>
            </td>
          </tr>
          
          {/* Footer */}
          <tr>
            <td 
              align="center" 
              style={{
                backgroundColor: '#f1f1f1',
                padding: '30px 20px'
              }}
            >
              <p style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>
                Luna Inc., Nairobi, Kenya
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#888',
                margin: '0'
              }}>
                <a 
                  href="https://lunadrone.com/privacy-policy" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Privacy Policy
                </a>
                {' | '}
                <a 
                  href="https://lunadrone.com/terms-and-conditions" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Terms of Service
                </a>
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#aaa',
                marginTop: '10px',
                margin: '10px 0 0 0'
              }}>
                © 2025 Luna Inc.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
export function NotifyTaskAssigned({ 
  username,
  sender,
  title,
  description
}: { 
  username: string;
  sender: string,
  title: string,
  description: string
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <head>
        <meta charSet="UTF-8" />
        <title>New Task Assigned - Luna</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <table 
          width="100%" 
          cellSpacing="0" 
          cellPadding="0" 
         style={{ backgroundColor: '#ffffff', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse' }}
        >
          {/* Header with Logo */}
          <tr>
            <td 
              align="center" 
              style={{
                padding: '20px 0',
                backgroundColor: '#2c3e50'
              }}
            >
            <img 
                src="https://lunadrone.com/icon1.png" 
                alt="Luna Logo" 
                width="40" 
                height="40" 
              />
            </td>
          </tr>
          
          {/* Main Content */}
          <tr>
            <td 
              align="center" 
              style={{ padding: '40px 20px' }}
            >
              
              
              <h1 style={{
                fontSize: '24px',
                marginBottom: '20px',
                margin: '0 0 20px 0',
                color: '#007bff'
              }}>
                New Task Assigned
              </h1>
              
              <p style={{
                fontSize: '16px',
                marginBottom: '30px',
                margin: '0 0 30px 0',
                textTransform: 'capitalize',
              }}>
                Hi <strong>{username}</strong>,
              </p>
              
              <p style={{
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 30px',
                lineHeight: '1.5'
              }}>
                You have been assigned a new task by <strong>{sender}</strong>. Please review the details below and take appropriate action.
              </p>
              
              {/* Task Details Card */}
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '500px',
                margin: '0 auto 30px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 15px 0',
                  color: '#333'
                }}>
                  Task Details
                </h3>
                
                <p style={{
                  fontSize: '14px',
                  margin: '0 0 10px 0',
                  color: '#666'
                }}>
                  <strong>Title:</strong> {title}
                </p>
                
                <p style={{
                  fontSize: '14px',
                  margin: '0 0 10px 0',
                  color: '#666'
                }}>
                  <strong>Assigned by:</strong> {sender}
                </p>
                
                <p style={{
                  fontSize: '14px',
                  margin: '0',
                  color: '#666'
                }}>
                  <strong>Description:</strong>
                </p>
                <p style={{
                  fontSize: '14px',
                  margin: '5px 0 0 0',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  {description}
                </p>
              </div>
              
             
              
              <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                maxWidth: '500px',
                margin: '40px auto 0'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  margin: '0 0 10px 0',
                  color: '#856404'
                }}>
                  Important Reminder:
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#856404',
                  margin: '0',
                  lineHeight: '1.4'
                }}>
                  Please acknowledge receipt of this task and provide updates on your progress. 
                  Log in to your dashboard to manage your tasks and communicate with your team.
                </p>
              </div>
            </td>
          </tr>
          
          {/* Footer */}
          <tr>
            <td 
              align="center" 
              style={{
                backgroundColor: '#f1f1f1',
                padding: '30px 20px'
              }}
            >
              <p style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>
                Luna Inc., Nairobi, Kenya
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#888',
                margin: '0'
              }}>
                <a 
                  href="https://lunadrone.com/privacy-policy" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Privacy Policy
                </a>
                {' | '}
                <a 
                  href="https://lunadrone.com/terms-and-conditions" 
                  style={{
                    color: '#888',
                    margin: '0 8px'
                  }}
                >
                  Terms of Service
                </a>
              </p>
              
              <p style={{
                fontSize: '12px',
                color: '#aaa',
                marginTop: '10px',
                margin: '10px 0 0 0'
              }}>
                © 2025 Luna Inc.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

