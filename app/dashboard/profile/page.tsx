"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [roleSpecificData, setRoleSpecificData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
          
        if (userError) throw userError
        setProfileData(userData)
        
        // Fetch role-specific data
        if (user.role === "donor") {
          const { data: donorData, error: donorError } = await supabase
            .from("donors")
            .select("*")
            .eq("id", user.id)
            .single()
            
          if (donorError) throw donorError
          setRoleSpecificData(donorData)
        } else if (user.role === "ngo") {
          const { data: ngoData, error: ngoError } = await supabase
            .from("ngos")
            .select("*")
            .eq("id", user.id)
            .single()
            
          if (ngoError) throw ngoError
          setRoleSpecificData(ngoData)
        } else if (user.role === "volunteer") {
          const { data: volunteerData, error: volunteerError } = await supabase
            .from("volunteers")
            .select("*")
            .eq("id", user.id)
            .single()
            
          if (volunteerError) throw volunteerError
          setRoleSpecificData(volunteerData)
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        setError(err.message || "Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfileData()
  }, [supabase, user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profileData) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zip_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        
      if (updateError) throw updateError
      
      // Update role-specific data
      if (user.role === "donor" && roleSpecificData) {
        const { error: donorError } = await supabase
          .from("donors")
          .update({
            business_name: roleSpecificData.business_name,
            business_type: roleSpecificData.business_type,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          
        if (donorError) throw donorError
      } else if (user.role === "ngo" && roleSpecificData) {
        const { error: ngoError } = await supabase
          .from("ngos")
          .update({
            organization_name: roleSpecificData.organization_name,
            description: roleSpecificData.description,
            website: roleSpecificData.website,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          
        if (ngoError) throw ngoError
      } else if (user.role === "volunteer" && roleSpecificData) {
        const { error: volunteerError } = await supabase
          .from("volunteers")
          .update({
            vehicle_type: roleSpecificData.vehicle_type,
            max_distance: roleSpecificData.max_distance,
            service_areas: roleSpecificData.service_areas,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          
        if (volunteerError

\
Let's create a donation details page:
