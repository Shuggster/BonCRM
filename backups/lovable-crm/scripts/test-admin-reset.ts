import { createClient } from '@supabase/supabase-js';

async function testAdminReset() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/reset-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Reset result:', result);

        if (result.success) {
            console.log('Now try logging in with:');
            console.log('Email: hugh@bonnymans.co.uk');
            console.log('Password: Temp123!@#');
        }
    } catch (error) {
        console.error('Failed:', error);
    }
}

testAdminReset();
