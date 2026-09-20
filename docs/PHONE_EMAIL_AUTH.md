# Phone.Email Authentication Integration

This document describes the Phone.Email authentication integration in Campus Connect Hub.

## Overview

Phone.Email provides a secure phone number verification service that adds an additional authentication method alongside email/password and Google SSO. Users can verify their identity using their phone number, making the authentication process more accessible and secure.

## Features

- **Phone Number Verification**: Users verify their identity using their mobile phone number
- **Automatic Account Matching**: Existing users with registered phone numbers are logged in automatically
- **New User Registration**: New users can complete registration with pre-filled phone information
- **Multi-Factor Support**: Works alongside existing authentication methods
- **International Support**: Supports international phone numbers with country codes

## How It Works

### User Flow

1. **On Login Page**: User clicks "Sign in with Phone" button
2. **Phone.Email Widget**: Phone.Email's secure widget appears
3. **Verification**: User enters their phone number and verifies it via SMS/call
4. **Backend Verification**: Our backend verifies the phone number with Phone.Email
5. **Account Matching**:
   - If phone number exists in database → User is logged in
   - If phone number is new → User is redirected to registration with pre-filled data

### Technical Flow

```
Frontend (LoginPage.tsx)
    ↓
PhoneEmailAuth Component loads Phone.Email script
    ↓
User verifies phone → receives user_json_url
    ↓
Frontend sends user_json_url to backend
    ↓
Backend (phoneEmailService.ts)
    ↓
Fetches user data from Phone.Email's secure URL
    ↓
Validates phone number
    ↓
Checks database for existing account
    ↓
Returns account or registration data
    ↓
Frontend logs in user or shows registration form
```

## Files Structure

### Frontend Components

- **`src/components/auth/PhoneEmailAuth.tsx`**
  - Main Phone.Email authentication component
  - Loads Phone.Email script dynamically
  - Handles verification callbacks
  - Provides styled button variants

- **`src/components/auth/LoginPage.tsx`**
  - Integrates Phone.Email authentication into login flow
  - Handles authentication success/failure
  - Pre-fills registration form for new users

### Backend Services

- **`src/server/phoneEmailService.ts`**
  - Verifies user data from Phone.Email
  - Validates phone number format
  - Provides utility functions for phone formatting

- **`src/server/api-router.ts`**
  - API endpoint: `POST /api/auth/phone-email/verify`
  - Validates user_json_url
  - Checks existing accounts
  - Returns account or registration data

### API Client

- **`src/lib/api-client.ts`**
  - Frontend helper: `apiClient.verifyPhoneEmail()`
  - Handles API communication with type safety

## Configuration

### Phone.Email Client ID

The client ID is configured in `PhoneEmailAuth.tsx`:

```tsx
<div 
  className="pe_signin_button" 
  data-client-id="11230043630311578801"
/>
```

### Customizing the Button

Visit the Phone.Email Admin Dashboard → Button Settings to customize:
- Button text
- Button color
- Button size
- Logo display
- Language

Changes apply automatically without code updates.

### Environment Variables

No environment variables needed for basic setup. The integration uses:
- Public Phone.Email client ID (safe to commit)
- Secure server-side verification via user_json_url

## API Endpoint

### `POST /api/auth/phone-email/verify`

Verifies phone number and returns user account or registration data.

**Request Body:**
```json
{
  "user_json_url": "https://user.phone.email/user_abcxd123fgbfg43454.json",
  "role": "student" // optional: "student", "organizer", "admin"
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "message": "Welcome back, John Doe!",
  "account": {
    "role": "student",
    "name": "John Doe",
    "email": "john@gsfcuniversity.ac.in",
    "profile": { /* full profile object */ }
  },
  "isExistingUser": true,
  "phoneData": {
    "countryCode": "+91",
    "phoneNumber": "9876543210",
    "fullPhoneNumber": "+919876543210"
  }
}
```

**Response (New User):**
```json
{
  "success": true,
  "message": "Phone number verified successfully. Please complete your registration.",
  "isExistingUser": false,
  "phoneData": {
    "countryCode": "+91",
    "phoneNumber": "9876543210",
    "fullPhoneNumber": "+919876543210",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

## Usage Examples

### Basic Integration

```tsx
import { PhoneEmailAuth } from "@/components/auth/PhoneEmailAuth";

function MyLoginComponent() {
  const handleSuccess = async (userJsonUrl: string) => {
    // Send to backend for verification
    const result = await fetch('/api/auth/phone-email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_json_url: userJsonUrl })
    });
    
    const data = await result.json();
    
    if (data.isExistingUser) {
      // Log in the user
      loginUser(data.account);
    } else {
      // Show registration form
      showRegistration(data.phoneData);
    }
  };

  return (
    <PhoneEmailAuth
      onSuccess={handleSuccess}
      onError={(error) => console.error(error)}
    />
  );
}
```

### With Custom Styling

```tsx
import { PhoneEmailAuthButton } from "@/components/auth/PhoneEmailAuth";

function MyLoginForm() {
  return (
    <div>
      {/* Your login form */}
      
      <PhoneEmailAuthButton
        onSuccess={handlePhoneAuth}
        onError={handleError}
        className="mt-4"
      />
    </div>
  );
}
```

### Backend Verification

```typescript
import { verifyPhoneEmailUser } from "./phoneEmailService";

async function handlePhoneAuth(userJsonUrl: string) {
  const result = await verifyPhoneEmailUser(userJsonUrl);
  
  if (!result.success) {
    return { error: result.error };
  }
  
  const { user_country_code, user_phone_number, user_first_name, user_last_name } = result.data;
  
  // Check database for existing user
  const existingUser = await findUserByPhone(
    `${user_country_code}${user_phone_number}`
  );
  
  if (existingUser) {
    return { user: existingUser, isNew: false };
  }
  
  return { 
    phoneData: result.data, 
    isNew: true 
  };
}
```

## Security Considerations

### Why Backend Verification?

The `user_json_url` MUST be verified on the backend because:

1. **Prevents Tampering**: Users cannot forge phone numbers
2. **Secure Token**: The URL is temporary and single-use
3. **Official Data**: Only Phone.Email servers can provide valid user data
4. **Privacy**: Phone numbers never exposed to client-side code

### Best Practices

✅ **DO:**
- Always verify `user_json_url` on your backend
- Check if URL starts with `https://user.phone.email/`
- Validate phone number format before storing
- Match phone numbers to existing accounts securely
- Log authentication events for audit trail

❌ **DON'T:**
- Trust phone data from client without verification
- Store raw user_json_url permanently
- Expose phone numbers in logs or error messages
- Skip phone number format validation
- Allow multiple accounts with same phone number (unless intentional)

## Testing

### Development Testing

The integration works immediately with no configuration needed:

1. Start dev server: `npm run dev`
2. Navigate to login page
3. Click "Sign in with Phone" (below Google button)
4. Enter phone number in Phone.Email widget
5. Verify with SMS code
6. Check browser console for verification flow

### Manual Testing Checklist

- [ ] Phone.Email button loads correctly
- [ ] Can enter international phone numbers
- [ ] SMS verification code received
- [ ] Existing user login works
- [ ] New user redirected to registration
- [ ] Registration form pre-filled correctly
- [ ] Phone number stored in database
- [ ] Error handling for invalid URLs
- [ ] Error handling for network failures

## Troubleshooting

### Button Not Loading

**Symptom**: Phone.Email button doesn't appear or shows loading indefinitely

**Solutions**:
- Check browser console for script loading errors
- Verify internet connection
- Check if Phone.Email service is accessible
- Try clearing browser cache

### Verification Failed

**Symptom**: Phone verification completes but login fails

**Solutions**:
- Check backend logs for API errors
- Verify `user_json_url` format
- Check database connection
- Ensure API endpoint is accessible

### Script Loading Error

**Symptom**: "Failed to load Phone.Email authentication service"

**Solutions**:
```tsx
// Add error handling
<PhoneEmailAuth
  onSuccess={handleSuccess}
  onError={(error) => {
    console.error('Phone.Email error:', error);
    // Show user-friendly message
    toast.error('Phone verification temporarily unavailable');
  }}
/>
```

### CORS Issues

**Symptom**: Backend cannot fetch from `user_json_url`

**Solutions**:
- Ensure server can make external HTTPS requests
- Check firewall rules
- Verify SSL certificates are valid
- Phone.Email URLs should be accessible (they use proper CORS headers)

## Customization

### Button Text

Customize in Phone.Email Dashboard → Button Settings:
- "Sign in with Phone Number"
- "Verify with Phone"
- "Phone Login"
- Or any custom text in multiple languages

### Button Styling

The component provides two variants:

**Basic (minimal styling)**:
```tsx
<PhoneEmailAuth onSuccess={handler} />
```

**Styled (with divider and branding)**:
```tsx
<PhoneEmailAuthButton onSuccess={handler} />
```

### Custom Wrapper

```tsx
<div className="my-custom-auth-section">
  <h3>Additional Sign-In Options</h3>
  <PhoneEmailAuth
    onSuccess={handleAuth}
    className="custom-button-container"
  />
</div>
```

## Migration Guide

### Adding to Existing Login System

1. Install the Phone.Email components (already done)
2. Add the API endpoint to your router (already done)
3. Add Phone.Email button to your login form:

```tsx
// In your LoginPage or LoginForm component
import { PhoneEmailAuthButton } from "@/components/auth/PhoneEmailAuth";

// Inside your form, after other login methods:
<PhoneEmailAuthButton
  onSuccess={handlePhoneEmailAuth}
  onError={(error) => setErrorMessage(error)}
/>
```

4. Add handler for verification (already implemented in LoginPage.tsx)

### Database Schema

Ensure your users table has a phone number field:

```sql
ALTER TABLE new_registered_students 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Add unique constraint if needed
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_mobile 
ON new_registered_students(mobile_number) 
WHERE mobile_number IS NOT NULL;
```

## Support

### Phone.Email Support
- Dashboard: https://phone.email/dashboard
- Documentation: https://phone.email/docs
- Support: Contact through dashboard

### Campus Connect Hub
- Check existing issues in repository
- Create new issue with "phone-email" label
- Include browser console logs and backend logs

## License

This integration follows:
- Phone.Email: Their terms of service
- Campus Connect Hub: MIT License (see LICENSE file)

## References

- [Phone.Email Official Documentation](https://phone.email/docs)
- [Phone.Email Button Customization](https://phone.email/dashboard/button-settings)
- [Campus Connect Hub Authentication Guide](./AUTHENTICATION.md)
