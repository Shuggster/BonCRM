import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Define valid roles and their default permissions
const rolePermissions = {
  admin: [
    'create_user', 'edit_user', 'delete_user',
    'create_team', 'manage_team',
    'view_contacts', 'manage_contacts',
    'assign_tasks',
    'manage_system'
  ],
  manager: [
    'edit_user',
    'create_team', 'manage_team',
    'view_contacts', 'manage_contacts',
    'assign_tasks'
  ],
  operational: [
    'view_contacts',
    'assign_tasks'
  ]
}

export async function GET(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    // Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const roleId = params.roleId
    if (!rolePermissions[roleId as keyof typeof rolePermissions]) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get role permissions from the database
    const { data: storedPermissions, error } = await supabase
      .from('role_permissions')
      .select('permission_name, enabled')
      .eq('role', roleId)

    // If there's an error or no stored permissions, return default permissions
    if (error || !storedPermissions?.length) {
      return NextResponse.json({
        permissions: rolePermissions[roleId as keyof typeof rolePermissions]
          .map(permission => ({
            permission_name: permission,
            enabled: true
          }))
      })
    }

    // Convert stored permissions to a map for easy lookup
    const permissionMap = new Map(
      storedPermissions.map(p => [p.permission_name, p.enabled])
    )

    // Combine default permissions with stored overrides
    const permissions = rolePermissions[roleId as keyof typeof rolePermissions]
      .map(permission => ({
        permission_name: permission,
        enabled: permissionMap.has(permission) 
          ? permissionMap.get(permission)
          : true
      }))

    return NextResponse.json({ permissions })
  } catch (error: any) {
    console.error("Error in permissions route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    // Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const roleId = params.roleId
    if (!rolePermissions[roleId as keyof typeof rolePermissions]) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Input validation
    const body = await request.json()
    const { permissions } = body
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Invalid permissions format" },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // First delete existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', roleId)

    if (deleteError) {
      console.error("Error deleting permissions:", deleteError)
      return NextResponse.json(
        { error: "Failed to update permissions" },
        { status: 500 }
      )
    }

    // Then insert new permissions
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(
        permissions.map(p => ({
          role: roleId,
          permission_name: p.permission_name,
          enabled: p.enabled
        }))
      )

    if (insertError) {
      console.error("Error inserting permissions:", insertError)
      return NextResponse.json(
        { error: "Failed to update permissions" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      updated: permissions
    })

  } catch (error: any) {
    console.error("Error in permissions route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 