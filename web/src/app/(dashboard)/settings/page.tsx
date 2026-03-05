'use client';

import {
  Header,
  PageContainer,
  Card,
  CardHeader,
  CardContent,
} from '@/components/global';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <PageContainer>
      <Header
        title="Settings"
        description="Configure system settings and preferences"
        icon="⚙️"
      />

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">General Settings</h3>
            <p className="text-sm text-gray-600">Basic system configuration</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Printer Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Printer Settings</h3>
            <p className="text-sm text-gray-600">
              Configure label printer settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Network Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Network Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-ip">Printer IP Address</Label>
                  <Input
                    id="printer-ip"
                    placeholder="192.168.1.75"
                    defaultValue="192.168.1.75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printer-port">Port Number</Label>
                  <Input
                    id="printer-port"
                    type="number"
                    placeholder="9100"
                    defaultValue="9100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection-timeout">
                    Connection Timeout (ms)
                  </Label>
                  <Input
                    id="connection-timeout"
                    type="number"
                    placeholder="5000"
                    defaultValue="5000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Label Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Label Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page-size">Page Size</Label>
                  <Select defaultValue="100x50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100x50">100mm x 50mm</SelectItem>
                      <SelectItem value="100x75">100mm x 75mm</SelectItem>
                      <SelectItem value="150x100">150mm x 100mm</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select defaultValue="0">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Portrait (0°)</SelectItem>
                      <SelectItem value="90">Landscape (90°)</SelectItem>
                      <SelectItem value="180">Portrait (180°)</SelectItem>
                      <SelectItem value="270">Landscape (270°)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom dimensions - shown when custom is selected */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Custom Width (mm)</Label>
                  <Input id="custom-width" type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-height">Custom Height (mm)</Label>
                  <Input id="custom-height" type="number" placeholder="50" />
                </div>
              </div>
            </div>

            <Separator />

            {/* QR Code Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">QR Code Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">QR Size</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Small (3)</SelectItem>
                      <SelectItem value="4">Medium (4)</SelectItem>
                      <SelectItem value="5">Large (5)</SelectItem>
                      <SelectItem value="6">Extra Large (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-x">QR X Position</Label>
                  <Input
                    id="qr-x"
                    type="number"
                    placeholder="100"
                    defaultValue="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-y">QR Y Position</Label>
                  <Input
                    id="qr-y"
                    type="number"
                    placeholder="60"
                    defaultValue="60"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Text Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Text Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="text-x">Text X Position</Label>
                  <Input
                    id="text-x"
                    type="number"
                    placeholder="100"
                    defaultValue="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-y">Text Y Position</Label>
                  <Input
                    id="text-y"
                    type="number"
                    placeholder="280"
                    defaultValue="280"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Small (1)</SelectItem>
                      <SelectItem value="2">Medium (2)</SelectItem>
                      <SelectItem value="3">Large (3)</SelectItem>
                      <SelectItem value="4">Extra Large (4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Print Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Print Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="copies">Copies per Print</Label>
                  <Input
                    id="copies"
                    type="number"
                    placeholder="1"
                    defaultValue="1"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="print-speed">Print Speed</Label>
                  <Select defaultValue="4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ips</SelectItem>
                      <SelectItem value="2">2 ips</SelectItem>
                      <SelectItem value="3">3 ips</SelectItem>
                      <SelectItem value="4">4 ips</SelectItem>
                      <SelectItem value="5">5 ips</SelectItem>
                      <SelectItem value="6">6 ips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-cut" defaultChecked />
                <Label htmlFor="auto-cut">Auto-cut after printing</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </PageContainer>
  );
}
