import { lazy, Suspense } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { useAuthStore } from './stores/auth';

// Critical landing pages
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/main/HomePage';

// Lazy-loaded pages (Code-Splitting for mobile performance)
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const TasksPage = lazy(() => import('./pages/main/TasksPage'));
const VipPage = lazy(() => import('./pages/main/VipPage'));
const ProfilePage = lazy(() => import('./pages/main/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/main/NotificationsPage'));
const DepositPage = lazy(() => import('./pages/financial/DepositPage'));
const WithdrawPage = lazy(() => import('./pages/financial/WithdrawPage'));
const TransactionsPage = lazy(() => import('./pages/financial/TransactionsPage'));
const CheckinPage = lazy(() => import('./pages/engagement/CheckinPage'));
const ReferralPage = lazy(() => import('./pages/engagement/ReferralPage'));
const LicensePage = lazy(() => import('./pages/legal/LicensePage'));
const CustomerServicePage = lazy(() => import('./pages/legal/CustomerServicePage'));
const FaqPage = lazy(() => import('./pages/legal/FaqPage'));
const AnnouncementPage = lazy(() => import('./pages/legal/AnnouncementPage'));
const PaymentAddressPage = lazy(() => import('./pages/financial/PaymentAddressPage'));
const FundsDetailsPage = lazy(() => import('./pages/financial/FundsDetailsPage'));
const AccountSecurityPage = lazy(() => import('./pages/main/AccountSecurityPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage'));

const RouteLoading = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <IonSpinner name="crescent" color="primary" />
  </div>
);

function PrivateRoute({ children, ...rest }: any) {
  const { user } = useAuthStore();
  return (
    <Route
      {...rest}
      render={({ location }: { location: any }) =>
        user ? (
          children
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: location } }} />
        )
      }
    />
  );
}

function GuestRoute({ children, ...rest }: any) {
  const { user } = useAuthStore();
  return (
    <Route
      {...rest}
      render={({ location }: { location: any }) =>
        !user ? (
          children
        ) : (
          <Redirect to={{ pathname: '/home', state: { from: location } }} />
        )
      }
    />
  );
}

function AdminRoute({ children, ...rest }: any) {
  const { user, profile } = useAuthStore();
  if (!user) {
    return (
      <Route
        {...rest}
        render={() => <Redirect to={{ pathname: '/login' }} />}
      />
    );
  }
  if (!profile?.is_admin) {
    return (
      <Route
        {...rest}
        render={() => <Redirect to={{ pathname: '/home' }} />}
      />
    );
  }
  return <Route {...rest} render={() => children} />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <GuestRoute exact path="/login">
          <LoginPage />
        </GuestRoute>
        <GuestRoute exact path="/register">
          <RegisterPage />
        </GuestRoute>

        <PrivateRoute exact path="/home">
          <HomePage />
        </PrivateRoute>
        <PrivateRoute exact path="/tasks">
          <TasksPage />
        </PrivateRoute>
        <PrivateRoute exact path="/vip">
          <VipPage />
        </PrivateRoute>
        <PrivateRoute exact path="/profile">
          <ProfilePage />
        </PrivateRoute>
        <PrivateRoute exact path="/notifications">
          <NotificationsPage />
        </PrivateRoute>
        <PrivateRoute exact path="/deposit">
          <DepositPage />
        </PrivateRoute>
        <PrivateRoute exact path="/withdraw">
          <WithdrawPage />
        </PrivateRoute>
        <PrivateRoute exact path="/transactions">
          <TransactionsPage />
        </PrivateRoute>
        <PrivateRoute exact path="/welfare">
          <CheckinPage />
        </PrivateRoute>
        <PrivateRoute exact path="/checkin">
          <CheckinPage />
        </PrivateRoute>
        <PrivateRoute exact path="/lucky-bag">
          <Redirect to="/welfare" />
        </PrivateRoute>
        <PrivateRoute exact path="/referral">
          <ReferralPage />
        </PrivateRoute>
        <PrivateRoute exact path="/license">
          <LicensePage />
        </PrivateRoute>
        <PrivateRoute exact path="/faq">
          <FaqPage />
        </PrivateRoute>
        <PrivateRoute exact path="/announcements">
          <AnnouncementPage />
        </PrivateRoute>
        <PrivateRoute exact path="/payment-address">
          <PaymentAddressPage />
        </PrivateRoute>
        <PrivateRoute exact path="/funds-details">
          <FundsDetailsPage />
        </PrivateRoute>
        <PrivateRoute exact path="/account-security">
          <AccountSecurityPage />
        </PrivateRoute>
        <PrivateRoute exact path="/customer-service">
          <CustomerServicePage />
        </PrivateRoute>

        <AdminRoute exact path="/admin">
          <AdminDashboardPage />
        </AdminRoute>
        <AdminRoute exact path="/admin/users">
          <AdminUsersPage />
        </AdminRoute>
        <AdminRoute exact path="/admin/withdrawals">
          <AdminWithdrawalsPage />
        </AdminRoute>

        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </Suspense>
  );
}
