import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  Building2,
  ChartNoAxesColumn,
  CreditCard,
  FileText,
  Home,
  Layers,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Shield,
  User,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  section?: string;
};

export const navByKind: Record<string, NavItem[]> = {
  creator: [
    { href: "/app", label: "Home", icon: Home, mobile: true },
    { href: "/app/work", label: "Work", icon: Briefcase, mobile: true, section: "Work" },
    { href: "/app/jobs", label: "Jobs", icon: Search, mobile: true, section: "Work" },
    { href: "/app/invitations", label: "Invitations", icon: Mail, section: "Pipeline" },
    { href: "/app/applications", label: "Applications", icon: FileText, section: "Pipeline" },
    { href: "/app/campaigns", label: "Campaigns", icon: Layers, section: "Pipeline" },
    { href: "/app/messages", label: "Messages", icon: MessageSquare, section: "Inbox" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, section: "Inbox" },
    { href: "/app/insights", label: "Insights", icon: ChartNoAxesColumn, section: "Account" },
    { href: "/app/earnings", label: "Earnings", icon: Wallet, section: "Account" },
    { href: "/app/disputes", label: "Support", icon: Shield, section: "Account" },
    { href: "/app/profile", label: "Profile", icon: User, mobile: true, section: "Account" },
    { href: "/app/settings", label: "Settings", icon: Settings, section: "Account" },
  ],
  brand: [
    { href: "/app", label: "Home", icon: Home, mobile: true },
    { href: "/app/creators", label: "Creators", icon: UsersRound, mobile: true, section: "Find" },
    { href: "/app/briefs", label: "Briefs", icon: FileText, mobile: true, section: "Find" },
    { href: "/app/campaigns", label: "Campaigns", icon: Layers, mobile: true, section: "Run" },
    { href: "/app/analytics", label: "Analytics", icon: ChartNoAxesColumn, section: "Run" },
    { href: "/app/messages", label: "Messages", icon: MessageSquare, mobile: true, section: "Run" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, section: "Run" },
    { href: "/app/payments", label: "Payments", icon: CreditCard, section: "Org" },
    { href: "/app/disputes", label: "Support", icon: Shield, section: "Org" },
    { href: "/app/team", label: "Team", icon: Users, section: "Org" },
    { href: "/app/settings", label: "Settings", icon: Settings, section: "Org" },
  ],
  agency: [
    { href: "/app", label: "Portfolio", icon: Home, mobile: true, section: "Portfolio" },
    { href: "/app/brands", label: "Brands", icon: Building2, mobile: true, section: "Portfolio" },
    { href: "/app/creators", label: "Creators", icon: UsersRound, mobile: true, section: "Work" },
    { href: "/app/briefs", label: "Briefs", icon: FileText, mobile: true, section: "Work" },
    { href: "/app/campaigns", label: "Campaigns", icon: Layers, section: "Work" },
    { href: "/app/messages", label: "Messages", icon: MessageSquare, mobile: true, section: "Work" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, section: "Org" },
    { href: "/app/analytics", label: "Analytics", icon: ChartNoAxesColumn, section: "Org" },
    { href: "/app/payments", label: "Finance", icon: CreditCard, section: "Org" },
    { href: "/app/disputes", label: "Support", icon: Shield, section: "Org" },
    { href: "/app/team", label: "Team", icon: Users, section: "Org" },
    { href: "/app/settings", label: "Settings", icon: Settings, section: "Org" },
  ],
  admin: [
    { href: "/app", label: "Home", icon: Home, mobile: true },
    { href: "/app/creators", label: "Creators", icon: UsersRound, mobile: true, section: "Ops" },
    { href: "/app/briefs", label: "Briefs", icon: FileText, mobile: true, section: "Ops" },
    { href: "/app/admin", label: "Moderation", icon: Shield, mobile: true, section: "Ops" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, section: "Ops" },
    { href: "/app/analytics", label: "Analytics", icon: ChartNoAxesColumn, section: "Ops" },
    { href: "/app/settings", label: "Settings", icon: Settings, mobile: true },
  ],
};

export function groupNav(items: NavItem[]) {
  const groups: { label?: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.label === item.section) {
      last.items.push(item);
    } else {
      groups.push({ label: item.section, items: [item] });
    }
  }
  return groups;
}
