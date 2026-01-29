class Recipient < ApplicationRecord
  has_many :awards, dependent: :nullify

  validates :name, presence: true

  TYPES = %w[business nonprofit government individual other].freeze

  validates :recipient_type, inclusion: { in: TYPES }, allow_nil: true

  scope :by_state, ->(state) { where(state: state) }
  scope :by_type, ->(type)   { where(recipient_type: type) }

  def total_received
    awards.sum(:amount)
  end

  def award_count
    awards.count
  end
end
