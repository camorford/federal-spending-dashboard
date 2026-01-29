class Award < ApplicationRecord
  belongs_to :agency, optional: true
  belongs_to :recipient, optional: true

  TYPES = %w[contract grant loan direct_payment other].freeze

  validates :award_type, presence: true, inclusion: { in: TYPES }
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :awarded_on, presence: true
  validates :usaspending_id, uniqueness: true, allow_nil: true

  scope :by_agency, -> (agency_id) { where(agency_id: agency_id) }
  scope :by_type, -> (type) {where(award_type: type) }
  scope :by_state, ->(state) { where(place_of_performance_state: state) }
  scope :by_date_range, ->(start_date, end_date) { where(awarded_on: start_date..end_date) }
  scope :recent, -> { order(awarded_on: :desc) }

  def self.pg_search(query)
    # in case ES fails
    where("description ILIKE :q OR EXISTS (
      SELECT 1 FROM recipients WHERE recipients.id = awards.recipient_id AND recipients.name ILIKE :q
    )", q: "%#{query}%")
  end
end
