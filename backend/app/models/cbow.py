import torch
import torch.nn as nn
import torch.nn.functional as F

class CBOWModel(nn.Module):
    """
    Continuous Bag of Words (CBOW) architecture with Negative Sampling.
    Predicts a target word given an averaged representation of surrounding context words.
    """
    def __init__(self, vocab_size: int, embedding_dim: int):
        super(CBOWModel, self).__init__()
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        
        # Context embedding matrix (input layer)
        self.in_embeddings = nn.Embedding(vocab_size, embedding_dim)
        # Target embedding matrix (output layer)
        self.out_embeddings = nn.Embedding(vocab_size, embedding_dim)
        
        # Initialize weights with standard normal scaled down
        init_range = 0.5 / embedding_dim
        self.in_embeddings.weight.data.uniform_(-init_range, init_range)
        self.out_embeddings.weight.data.zero_()

    def forward(self, context_indices: torch.Tensor, target_indices: torch.Tensor, neg_indices: torch.Tensor):
        """
        context_indices: Tensor of shape (batch_size, context_len)
        target_indices: Tensor of shape (batch_size,)
        neg_indices: Tensor of shape (batch_size, num_neg_samples)
        """
        # Embed context words: (batch_size, context_len, embedding_dim)
        context_embeds = self.in_embeddings(context_indices)
        # Average context vectors along dimension 1: (batch_size, embedding_dim)
        c_mean = torch.mean(context_embeds, dim=1)

        # Target positive embedding: (batch_size, embedding_dim)
        target_embeds = self.out_embeddings(target_indices)

        # Positive dot products: (batch_size,)
        pos_score = torch.sum(c_mean * target_embeds, dim=1)
        pos_loss = -F.logsigmoid(pos_score)

        # Negative embeddings: (batch_size, num_neg_samples, embedding_dim)
        neg_embeds = self.out_embeddings(neg_indices)
        # Negative dot products: (batch_size, num_neg_samples)
        neg_score = torch.bmm(neg_embeds, c_mean.unsqueeze(2)).squeeze(2)
        neg_loss = -F.logsigmoid(-neg_score).sum(dim=1)

        loss = (pos_loss + neg_loss).mean()
        return loss

    def get_embeddings(self) -> torch.Tensor:
        """
        Returns the learned input context embeddings (or average of input + output)
        normalized for cosine similarity calculations.
        """
        # Combine input and output embeddings for richer representation, or use input embeddings
        embeds = self.in_embeddings.weight.data + self.out_embeddings.weight.data
        return embeds
