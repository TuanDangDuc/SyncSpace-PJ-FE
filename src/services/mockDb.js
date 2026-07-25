import centricImg from '@/assets/centric.png'
import loftImg from '@/assets/loft.png'
import oasisImg from '@/assets/oasis.png'
import libraryImg from '@/assets/library.png'

const INITIAL_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@syncspace.com',
    password: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE',
    sex: 'MALE',
    dateOfBirth: '1995-05-15',
    avatarUrl: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-customer',
    username: 'tuan',
    email: 'tuan@syncspace.com',
    password: 'ts123',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    sex: 'MALE',
    dateOfBirth: '2000-10-20',
    avatarUrl: null,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'SyncSpace Centric',
    ward: 'Bến Nghé, Quận 1',
    workspaceCount: 4,
    description: 'Mid-century modern workspace featuring warm wooden desks, vintage desk lamps, and a cozy quiet atmosphere designed for deep focus.'
  },
  {
    id: 'loc-2',
    name: 'SyncSpace Loft',
    ward: 'Phường 6, Quận 3',
    workspaceCount: 3,
    description: 'Industrial chic loft with high ceilings, exposed red bricks, hanging green vines, and tall steel-frame windows that let in natural sunlight.'
  },
  {
    id: 'loc-3',
    name: 'SyncSpace Oasis',
    ward: 'Tân Phong, Quận 7',
    workspaceCount: 3,
    description: 'Minimalist modern glass-house workspace overlooking a peaceful tropical garden. Pure, calm, and inspiring.'
  },
  {
    id: 'loc-4',
    name: 'SyncSpace Library',
    ward: 'Phường 22, Bình Thạnh',
    workspaceCount: 2,
    description: 'Cozy study environment styled as a classic library. Complete with dark mahogany bookshelves, soft leather armchairs, and green bankers lamps.'
  }
];

const INITIAL_WORKSPACES = [
  // Location 1
  {
    id: 'ws-1-1',
    locationId: 'loc-1',
    roomNumber: '101',
    floor: 1,
    type: 'MEETING_ROOM',
    status: 'AVAILABLE',
    pricePerHour: 150000,
    capacity: 6,
    acreage: 25,
    thumbnailUrl: centricImg,
    location: { id: 'loc-1', name: 'SyncSpace Centric' }
  },
  {
    id: 'ws-1-2',
    locationId: 'loc-1',
    roomNumber: '102',
    floor: 1,
    type: 'PRIVATE_OFFICE',
    status: 'AVAILABLE',
    pricePerHour: 350000,
    capacity: 4,
    acreage: 18,
    thumbnailUrl: centricImg,
    location: { id: 'loc-1', name: 'SyncSpace Centric' }
  },
  {
    id: 'ws-1-3',
    locationId: 'loc-1',
    roomNumber: 'Desk 1',
    floor: 1,
    type: 'HOT_DESK',
    status: 'AVAILABLE',
    pricePerHour: 30000,
    capacity: 1,
    acreage: 4,
    thumbnailUrl: centricImg,
    location: { id: 'loc-1', name: 'SyncSpace Centric' }
  },
  {
    id: 'ws-1-4',
    locationId: 'loc-1',
    roomNumber: 'Desk 2',
    floor: 1,
    type: 'HOT_DESK',
    status: 'OCCUPIED',
    pricePerHour: 30000,
    capacity: 1,
    acreage: 4,
    thumbnailUrl: centricImg,
    location: { id: 'loc-1', name: 'SyncSpace Centric' }
  },
  // Location 2
  {
    id: 'ws-2-1',
    locationId: 'loc-2',
    roomNumber: '201',
    floor: 2,
    type: 'EVENT_SPACE',
    status: 'AVAILABLE',
    pricePerHour: 800000,
    capacity: 30,
    acreage: 120,
    thumbnailUrl: loftImg,
    location: { id: 'loc-2', name: 'SyncSpace Loft' }
  },
  {
    id: 'ws-2-2',
    locationId: 'loc-2',
    roomNumber: '202',
    floor: 2,
    type: 'MEETING_ROOM',
    status: 'AVAILABLE',
    pricePerHour: 180000,
    capacity: 8,
    acreage: 30,
    thumbnailUrl: loftImg,
    location: { id: 'loc-2', name: 'SyncSpace Loft' }
  },
  {
    id: 'ws-2-3',
    locationId: 'loc-2',
    roomNumber: 'Desk 5',
    floor: 2,
    type: 'HOT_DESK',
    status: 'AVAILABLE',
    pricePerHour: 35000,
    capacity: 1,
    acreage: 5,
    thumbnailUrl: loftImg,
    location: { id: 'loc-2', name: 'SyncSpace Loft' }
  },
  // Location 3
  {
    id: 'ws-3-1',
    locationId: 'loc-3',
    roomNumber: '301',
    floor: 3,
    type: 'PRIVATE_OFFICE',
    status: 'AVAILABLE',
    pricePerHour: 400000,
    capacity: 6,
    acreage: 22,
    thumbnailUrl: oasisImg,
    location: { id: 'loc-3', name: 'SyncSpace Oasis' }
  },
  {
    id: 'ws-3-2',
    locationId: 'loc-3',
    roomNumber: 'Desk 8',
    floor: 3,
    type: 'HOT_DESK',
    status: 'AVAILABLE',
    pricePerHour: 40000,
    capacity: 1,
    acreage: 5,
    thumbnailUrl: oasisImg,
    location: { id: 'loc-3', name: 'SyncSpace Oasis' }
  },
  {
    id: 'ws-3-3',
    locationId: 'loc-3',
    roomNumber: 'Desk 9',
    floor: 3,
    type: 'HOT_DESK',
    status: 'OCCUPIED',
    pricePerHour: 40000,
    capacity: 1,
    acreage: 5,
    thumbnailUrl: oasisImg,
    location: { id: 'loc-3', name: 'SyncSpace Oasis' }
  },
  // Location 4
  {
    id: 'ws-4-1',
    locationId: 'loc-4',
    roomNumber: '401',
    floor: 4,
    type: 'MEETING_ROOM',
    status: 'AVAILABLE',
    pricePerHour: 200000,
    capacity: 10,
    acreage: 35,
    thumbnailUrl: libraryImg,
    location: { id: 'loc-4', name: 'SyncSpace Library' }
  },
  {
    id: 'ws-4-2',
    locationId: 'loc-4',
    roomNumber: 'Desk 12',
    floor: 4,
    type: 'HOT_DESK',
    status: 'AVAILABLE',
    pricePerHour: 45000,
    capacity: 1,
    acreage: 6,
    thumbnailUrl: libraryImg,
    location: { id: 'loc-4', name: 'SyncSpace Library' }
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'booking-1',
    userId: 'user-customer',
    paymentStatus: 'PAID',
    totalCost: 150000,
    createAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 'user-customer', username: 'tuan' },
    bookingSlots: [
      {
        id: 'slot-1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        bookingStatus: 'CONFIRMED',
        workspace: {
          id: 'ws-1-1',
          roomNumber: '101',
          location: { id: 'loc-1', name: 'SyncSpace Centric' }
        }
      }
    ]
  }
];

// Helper to initialize local storage databases
function initStorage() {
  const storedUsers = localStorage.getItem('ss_users');
  if (!storedUsers) {
    localStorage.setItem('ss_users', JSON.stringify(INITIAL_USERS));
  } else {
    // Force sync credentials from codebase to localStorage
    const parsed = JSON.parse(storedUsers);
    INITIAL_USERS.forEach(initUser => {
      const idx = parsed.findIndex(u => u.username === initUser.username);
      if (idx !== -1) {
        parsed[idx].password = initUser.password;
        parsed[idx].email = initUser.email;
        parsed[idx].role = initUser.role;
      } else {
        parsed.push(initUser);
      }
    });
    localStorage.setItem('ss_users', JSON.stringify(parsed));
  }

  if (!localStorage.getItem('ss_locations')) {
    localStorage.setItem('ss_locations', JSON.stringify(INITIAL_LOCATIONS));
  }
  if (!localStorage.getItem('ss_workspaces')) {
    localStorage.setItem('ss_workspaces', JSON.stringify(INITIAL_WORKSPACES));
  }
  if (!localStorage.getItem('ss_bookings')) {
    localStorage.setItem('ss_bookings', JSON.stringify(INITIAL_BOOKINGS));
  }
}

initStorage();

export const mockDb = {
  getUsers: () => JSON.parse(localStorage.getItem('ss_users')),
  saveUsers: (data) => localStorage.setItem('ss_users', JSON.stringify(data)),

  getLocations: () => JSON.parse(localStorage.getItem('ss_locations')),
  saveLocations: (data) => localStorage.setItem('ss_locations', JSON.stringify(data)),

  getWorkspaces: () => JSON.parse(localStorage.getItem('ss_workspaces')),
  saveWorkspaces: (data) => localStorage.setItem('ss_workspaces', JSON.stringify(data)),

  getBookings: () => JSON.parse(localStorage.getItem('ss_bookings')),
  saveBookings: (data) => localStorage.setItem('ss_bookings', JSON.stringify(data)),

  getActiveUser: () => {
    const token = localStorage.getItem('ss_active_token');
    if (!token) return null;
    const users = mockDb.getUsers();
    return users.find(u => u.email === token || u.username === token) || null;
  },

  setActiveUser: (usernameOrEmail) => {
    localStorage.setItem('ss_active_token', usernameOrEmail);
  },

  clearActiveUser: () => {
    localStorage.removeItem('ss_active_token');
  }
};
