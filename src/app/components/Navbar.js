"use client"

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import Image from "next/image";
import { clearAuthSession } from '../lib/authSession';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const router = useRouter();
  const pathname = usePathname() || "";

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About us', href: '/about' },
    { name: 'Map', href: '/map' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ].map(item => ({
    ...item,
    current: pathname === item.href
  }));

  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [locationSent, setLocationSent] = useState(false); 
  const [profileImageError, setProfileImageError] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    router.refresh();
    router.push('/signin');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user
  useEffect(() => {
    if (!mounted) return;

    const fetchUser = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) return;

        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setProfileImageError(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [mounted]);

  // Once we have a user, ask for location & trigger nearby notifications
  useEffect(() => {
    if (!mounted) return;
    if (!user) return;
    if (locationSent) return;

    const token = Cookies.get("access_token");
    if (!token) return;

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      console.warn("Geolocation not available in this environment.");
      setLocationSent(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const formData = new FormData();
          formData.append("latitude", latitude.toString());
          formData.append("longitude", longitude.toString());

          const res = await fetch(`${API_BASE}/notifications/nearby`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData, // matches latitude/longitude = Form(...)
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            console.error("Failed to trigger nearby notifications:", data || res.statusText);
          }
        } catch (err) {
          console.error("Error sending location:", err);
        } finally {
          setLocationSent(true);
        }
      },
      (error) => {
        console.warn("User denied or error in geolocation:", error);
        setLocationSent(true);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [mounted, user, locationSent]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  const profileImage = profileImageError
    ? "/images/default-avatar.png"
    : user?.profile_photo_url || "/images/default-avatar.png";

  return (
    <Disclosure
      as="nav"
      className="relative bg-gray-800 dark:bg-gray-100/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center sm:justify-between">
          <div className="relative z-20 flex w-full items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex flex-shrink-0 items-center justify-center rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-5 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-5 group-data-open:block" />
            </DisclosureButton>
            {/* Mobile logo - centered */}
            <div className="flex flex-1 justify-center">
              <Image
                alt="purr-fect"
                src="/images/purrfect%20logo.png"
                width={80}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 hidden justify-center sm:pointer-events-auto sm:static sm:flex sm:flex-1 sm:items-center sm:justify-start">
            <div className="flex min-w-0 items-center justify-center overflow-hidden sm:overflow-visible">
              {/* Desktop logo */}
              <Image
                alt="purr-fect"
                src="/images/Purr-Fect.png"
                width={80}
                height={20}
                className="h-5 w-auto max-w-[96px] object-contain sm:max-w-none"
              />
            </div>
            <div className="hidden justify-center m-auto sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-20 ml-auto flex items-center gap-2 sm:gap-3">
            <div className="shrink-0 flex-shrink-0">
              <NotificationBell />
            </div>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-0 sm:ml-3 shrink-0 flex-shrink-0">
              <MenuButton className="relative flex rounded-full flex-shrink-0">
                <Image
                  alt="User profile"
                  src={profileImage}
                  width={40}
                  height={40}
                  priority
                  onError={() => setProfileImageError(true)}
                  className="size-8 sm:size-9 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 object-cover flex-shrink-0"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
              >
                <MenuItem>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                  >
                    Your profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 border-t border-white/10 px-3 py-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
