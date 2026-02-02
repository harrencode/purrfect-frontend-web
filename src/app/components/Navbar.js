"use client"

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import Image from "next/image";

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

  const handleLogout = () => {
    Cookies.remove('access_token', { path: '/' });
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

        const response = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
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

          const res = await fetch("http://localhost:8000/notifications/nearby", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData, // matches latitude/longitude = Form(...)
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            console.error("Failed to trigger nearby notifications:", data || res.statusText);
          } else {
            console.log("Nearby notifications triggered");
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

  const profileImage = user?.profile_photo_url || "/images/default-avatar.png";

  return (
    <Disclosure
      as="nav"
      className="relative bg-gray-800 dark:bg-gray-100/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
    >
      <div className="mx-10 max-w-7x2 px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Image
                alt="purr-fect"
                src="/images/Purr-Fect.png"
                className="h-5 w-auto"
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <NotificationBell />

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full">
                <Image
                  alt="User profile"
                  src={profileImage}
                  className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 object-cover"
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
        <div className="space-y-1 px-2 pt-2 pb-3">
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
