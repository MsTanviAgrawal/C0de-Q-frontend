import * as api from "../api/index";
import { showNotification } from "../Utils/Notification";

export const askquestion = (questiondata, navigate) => async (dispatch) => {

    let title = "";
    let tags = [];
    if (questiondata instanceof FormData) {
        title = questiondata.get("questiontitle") || "";
        tags = questiondata.get("questiontag") || [];
    } else {
        ({ questiontitle: title, questiontags: tags } = questiondata);
    }

    if (!title.trim()) {
        showNotification("Error", "Question title cannot be empty.");
        return;
    }

    if (!tags || (Array.isArray(tags) ? tags.length === 0 : !tags)) {
        showNotification("Error", "Please add at least one tag.");
        return;
    }

    try {
        // Backend will check subscription automatically
        const config = questiondata instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
        const { data } = await api.postquestion(questiondata, config);
        
        dispatch({ type: "POST_QUESTION", payload: data });
        dispatch(fetchallquestion());
        
        // Show success with remaining questions
        if (data.questionsRemaining !== undefined) {
            const remaining = data.questionsRemaining === 'Unlimited' ? 'Unlimited' : data.questionsRemaining;
            showNotification("Success", `Question posted! Questions remaining today: ${remaining}`);
        } else {
            showNotification("Success", "Question posted successfully!");
        }
        
        navigate("/");
    } catch (error) {
        console.log(error);
        
        // Re-throw the error so component can catch it and show modal
        throw error;
    }
};

// Fetch All Questions
export const fetchallquestion = () => async (dispatch) => {
    try {
        const { data } = await api.getallquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Alias for consistency
export const fetchallquestions = fetchallquestion;

// Fetch Video Questions
export const fetchvideoquestions = () => async (dispatch) => {
    try {
        const { data } = await api.getvideoquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Fetch Text Questions
export const fetchtextquestions = () => async (dispatch) => {
    try {
        const { data } = await api.gettextquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Delete Question
export const deletequestion = (id, navigate) => async (dispatch) => {
    try {
        await api.deletequestion(id);
        dispatch(fetchallquestion());
        showNotification("Success", "Question deleted successfully!");
        navigate("/");
    } catch (error) {
        console.log(error);
        const errorMsg = error.response?.data?.message || "Failed to delete question";
        showNotification("Error", errorMsg);
    }
};

// Edit Question
export const editquestion = (id, questionData, navigate) => async (dispatch) => {
    try {
        const { data } = await api.editquestion(id, questionData);
        dispatch(fetchallquestion());
        showNotification("Success", "Question updated successfully!");
        navigate(`/Question/${id}`);
    } catch (error) {
        console.log(error);
        const errorMsg = error.response?.data?.message || "Failed to update question";
        showNotification("Error", errorMsg);
    }
};

// Vote Question 
export const votequestion = (id, value) => async (dispatch) => {
    try {
        await api.votequestion(id, value);
        dispatch(fetchallquestion());

        let action = "";
        if (value === "upvote") {
            action = "upvoted";
        } else if (value === "downvote") {
            action = "downvoted";
        } else {
            action = "voted";
        }

        showNotification("Question Vote", `You ${action} a question.`);
    } catch (error) {
        console.log(error);
    }
};

// Post Answer
export const postanswer = (answerdata) => async (dispatch) => {
    try {
        const { id, noofanswers, answerbody, useranswered, userid } = answerdata;
        const { data } = await api.postanswer(id, noofanswers, answerbody, useranswered, userid);
        dispatch({ type: "POST_ANSWER", payload: data });
        dispatch(fetchallquestion());

        showNotification("New Answer", `${useranswered} answered your question!`);
    } catch (error) {
        console.log(error);
    }
};

// Delete Answer
export const deleteanswer = (id, answerid, noofanswers) => async (dispatch) => {
    try {
        await api.deleteanswer(id, answerid, noofanswers);
        dispatch(fetchallquestion());
    } catch (error) {
        console.log(error);
    }
};
