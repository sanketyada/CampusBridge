const Meeting = require('../models/Meeting');
const { nanoid } = require('nanoid');

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
  const { title, description, videoLink } = req.body;

  if (!title || !videoLink) {
    return res.status(400).json({ message: 'Title and Video Link are required' });
  }

  try {
    const meetingId = nanoid(10); // 10rd digit unique ID
    const meeting = await Meeting.create({
      title,
      description,
      videoLink,
      meetingId,
      organizer: req.user._id,
      status: 'ongoing',
      participants: [req.user._id],
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting', error: error.message });
  }
};

// @desc    Get all ongoing meetings
// @route   GET /api/meetings/ongoing
// @access  Private
const getOngoingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ status: 'ongoing' })
      .populate('organizer', 'name profilePicture department')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings' });
  }
};

// @desc    Validate meeting ID and join
// @route   POST /api/meetings/:id/join
// @access  Private
const joinMeeting = async (req, res) => {
  const { meetingId } = req.body;
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  if (meeting.status === 'ended') {
    return res.status(400).json({ message: 'This meeting has already ended' });
  }

  if (meeting.meetingId !== meetingId) {
    return res.status(401).json({ message: 'Invalid Meeting ID' });
  }

  // Add user to participants if not already there
  if (!meeting.participants.includes(req.user._id)) {
    meeting.participants.push(req.user._id);
    await meeting.save();
  }

  res.json({ message: 'Joined successfully', meeting });
};

// @desc    End a meeting
// @route   PUT /api/meetings/:id/end
// @access  Private
const endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only organizer can end meeting
    if (meeting.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can end this meeting' });
    }

    meeting.status = 'ended';
    await meeting.save();

    res.json({ message: 'Meeting ended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error ending meeting' });
  }
};

module.exports = {
  createMeeting,
  getOngoingMeetings,
  joinMeeting,
  endMeeting,
};
