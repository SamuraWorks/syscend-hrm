<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Commerce\app\Models\Product;

class PurchaseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Syscend-HRM License',
                'description' => 'License purchase for the Syscend-HRM platform. Buy a one-time perpetual license or pay yearly if preferred. Prices are configured by Syscend in Product > Pricing and can be adjusted at any time.',
                'category' => 'license',
                'type' => 'license',
                'price' => 0,
                'yearly_price' => 0,
                'one_time' => true,
                'sort' => 1,
                'notes' => 'Set the one-time and yearly license prices in the Syscend sales area before accepting purchases. Leave yearly price empty to only offer one-time.',
            ],
            [
                'name' => 'Deployment',
                'description' => 'Hosted deployment of Syscend-HRM on our managed infrastructure, including server setup, database configuration, and go-live.',
                'category' => 'service',
                'type' => 'deployment',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 2,
                'notes' => null,
            ],
            [
                'name' => 'Staff Training',
                'description' => 'Remote training sessions for administrators and end users to get the most out of Syscend-HRM.',
                'category' => 'service',
                'type' => 'training',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 3,
                'notes' => null,
            ],
            [
                'name' => 'On-Site Setup & Training',
                'description' => 'Our team visits your premises to configure Syscend-HRM and train your staff in person.',
                'category' => 'service',
                'type' => 'onsite',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 4,
                'notes' => 'Travel expenses may apply depending on location.',
            ],
            [
                'name' => 'Data Migration',
                'description' => 'Secure transfer of your existing employee and HR data into Syscend-HRM from spreadsheets or legacy systems.',
                'category' => 'service',
                'type' => 'migration',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 5,
                'notes' => null,
            ],
            [
                'name' => 'Custom Domain',
                'description' => 'Serve your Syscend-HRM instance on your own domain (e.g. hrm.yourcompany.com) with SSL.',
                'category' => 'service',
                'type' => 'domain',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 6,
                'notes' => null,
            ],
            [
                'name' => 'Custom Development',
                'description' => 'Bespoke features, integrations, reports, or branding built by the Syscend team for your organization.',
                'category' => 'service',
                'type' => 'custom',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 7,
                'notes' => 'Quoted per engagement.',
            ],
            [
                'name' => 'Priority Support',
                'description' => 'Guaranteed response times and a dedicated support channel for your organization.',
                'category' => 'service',
                'type' => 'support',
                'price' => 0,
                'yearly_price' => null,
                'one_time' => true,
                'sort' => 8,
                'notes' => null,
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}
