puts "Seeding database..."

agencies_data = [
  { code: 'DOD', name: 'Department of Defense', description: 'Responsible for military forces and national security.' },
  { code: 'HHS', name: 'Department of Health and Human Services', description: 'Protects the health of all Americans.' },
  { code: 'DOE', name: 'Department of Energy', description: 'Advances national energy security.' },
  { code: 'NASA', name: 'National Aeronautics and Space Administration', description: 'Responsible for the civilian space program.' },
  { code: 'DOT', name: 'Department of Transportation', description: 'Responsible for federal transportation policy.' },
  { code: 'VA', name: 'Department of Veterans Affairs', description: 'Provides services to veterans.' },
  { code: 'DHS', name: 'Department of Homeland Security', description: 'Responsible for public security.' },
  { code: 'EPA', name: 'Environmental Protection Agency', description: 'Protects human health and the environment.' },
  { code: 'NSF', name: 'National Science Foundation', description: 'Supports fundamental research and education.' },
  { code: 'USDA', name: 'Department of Agriculture', description: 'Provides leadership on food and agriculture.' }
]

agencies = agencies_data.map do |data|
  Agency.find_or_create_by!(code: data[:code]) do |agency|
    agency.name = data[:name]
    agency.description = data[:description]
  end
end

puts "Created #{agencies.count} agencies"

states = %w[CA TX NY FL IL PA OH GA NC MI CO AZ WA MA VA]
recipient_types = Recipient::TYPES

50.times do |i|
  Recipient.find_or_create_by!(name: "#{Faker::Company.name} #{i}") do |r|
    r.recipient_type = recipient_types.sample
    r.city = Faker::Address.city
    r.state = states.sample
    r.country = 'USA'
  end
end

recipients = Recipient.all
puts "Created #{recipients.count} recipients"

award_types = Award::TYPES

500.times do
  Award.create!(
    agency: agencies.sample,
    recipient: recipients.sample,
    award_type: award_types.sample,
    amount: rand(10_000..50_000_000),
    description: Faker::Lorem.paragraph(sentence_count: 2),
    awarded_on: Faker::Date.between(from: 2.years.ago, to: Date.today),
    period_of_performance_start: Faker::Date.between(from: 2.years.ago, to: 1.year.ago),
    period_of_performance_end: Faker::Date.between(from: 1.year.from_now, to: 3.years.from_now),
    place_of_performance_state: states.sample,
    usaspending_id: "SAMPLE-#{SecureRandom.hex(8).upcase}"
  )
end

puts "Created #{Award.count} awards"

SyncLog.create!(
  sync_type: 'full',
  status: 'completed',
  started_at: 1.hour.ago,
  completed_at: 30.minutes.ago,
  records_processed: Award.count,
  metadata: { source: 'seed_data' }
)

puts "Seeding complete!"