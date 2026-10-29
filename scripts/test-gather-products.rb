require "minitest/autorun"
require_relative "gather-products"

class CutIntroTest < Minitest::Test
  README = <<~MD
    # Thing

    Pitch.

    ## Who it’s for

    People.

    ### Detail

    Kept.

    ## Learn more

    - [Private](docs/x.md)
  MD

  def test_keeps_through_who_its_for_and_drops_the_rest
    assert_equal "# Thing\n\nPitch.\n\n## Who it’s for\n\nPeople.\n\n### Detail\n\nKept.\n",
                 cut_intro(README, "thing")
  end

  def test_stops_at_a_rule
    assert_equal "## Who it's for\n\nPeople.\n", cut_intro("## Who it's for\n\nPeople.\n---\nDev\n", "thing")
  end

  def test_fails_without_who_its_for
    assert_raises(SystemExit) { capture_io { cut_intro("# Thing\n", "thing") } }
  end
end
