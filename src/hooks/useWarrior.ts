import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../lib/constants'
import type { Warrior } from '../lib/types'

export function useWarrior() {
  const [warrior, setWarrior] = useState<Warrior | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing warrior in localStorage on mount
  useEffect(() => {
    const warriorId = localStorage.getItem(STORAGE_KEYS.WARRIOR_ID)
    const warriorName = localStorage.getItem(STORAGE_KEYS.WARRIOR_NAME)
    const warriorClan = localStorage.getItem(STORAGE_KEYS.WARRIOR_CLAN)

    if (warriorId && warriorName) {
      // Fetch warrior from database to get latest XP
      fetchWarrior(warriorId)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchWarrior = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('warriors')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      setWarrior(data)
      setIsRegistered(true)
    } catch (err) {
      console.error('Error fetching warrior:', err)
      // If warrior not found, clear localStorage
      localStorage.removeItem(STORAGE_KEYS.WARRIOR_ID)
      localStorage.removeItem(STORAGE_KEYS.WARRIOR_NAME)
      localStorage.removeItem(STORAGE_KEYS.WARRIOR_CLAN)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, clan?: string, contestId?: string) => {
    setLoading(true)
    setError(null)

    try {
      // Validate name
      if (!name || name.length < 3 || name.length > 20) {
        throw new Error('Warrior name must be 3-20 characters')
      }

      if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
        throw new Error('Warrior name can only contain letters, numbers, and spaces')
      }

      // Insert warrior into database
      const { data, error: insertError } = await supabase
        .from('warriors')
        .insert({
          name: name.trim(),
          clan: clan?.trim() || null,
          contest_id: contestId || null,
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation
          throw new Error('This warrior name is already taken')
        }
        throw insertError
      }

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.WARRIOR_ID, data.id)
      localStorage.setItem(STORAGE_KEYS.WARRIOR_NAME, data.name)
      if (data.clan) {
        localStorage.setItem(STORAGE_KEYS.WARRIOR_CLAN, data.clan)
      }

      setWarrior(data)
      setIsRegistered(true)

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.WARRIOR_ID)
    localStorage.removeItem(STORAGE_KEYS.WARRIOR_NAME)
    localStorage.removeItem(STORAGE_KEYS.WARRIOR_CLAN)
    setWarrior(null)
    setIsRegistered(false)
  }

  const refreshWarrior = async () => {
    if (warrior) {
      await fetchWarrior(warrior.id)
    }
  }

  return {
    warrior,
    isRegistered,
    loading,
    error,
    register,
    logout,
    refreshWarrior,
  }
}
