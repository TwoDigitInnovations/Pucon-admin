import React from 'react'
import Layout from '@/components/Layout'

function Carousel() {
    return (
        <Layout>
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-gray-900">Carousel</h2>
                </div>
            </div>
        </Layout>
    )
}

export default Carousel
