import torch
import torch.nn as nn
import torch.nn.functional as F

class SkipGramModel(nn.Module):
    """
    Skip-gram architecture with Negative Sampling.
    Predicts context words given a single target center word.
    """
    def __init__(self, vocab_size: int, embedding_dim: int):
        super(SkipGramModel, self).__init__()
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim

        # Target center word embedding matrix
        self.target_embeddings = nn.Embedding(vocab_size, embedding_dim)
        # Context word embedding matrix
        self.context_embeddings = nn.Embedding(vocab_size, embedding_dim)

        init_range = 0.5 / embedding_dim
        self.target_embeddings.weight.data.uniform_(-init_range, init_range)
        self.context_embeddings.weight.data.zero_()

    def forward(self, target_indices: torch.Tensor, pos_context_indices: torch.Tensor, neg_context_indices: torch.Tensor):
        """
        target_indices: Tensor of shape (batch_size,)
        pos_context_indices: Tensor of shape (batch_size,)
        neg_context_indices: Tensor of shape (batch_size, num_neg_samples)
        """
        # Target vectors: (batch_size, embedding_dim)
        target_embeds = self.target_embeddings(target_indices)

        # Positive context vectors: (batch_size, embedding_dim)
        pos_context_embeds = self.context_embeddings(pos_context_indices)

        # Positive dot product: (batch_size,)
        pos_score = torch.sum(target_embeds * pos_context_embeds, dim=1)
        pos_loss = -F.logsigmoid(pos_score)

        # Negative context vectors: (batch_size, num_neg_samples, embedding_dim)
        neg_context_embeds = self.context_embeddings(neg_context_indices)
        # Negative dot product: (batch_size, num_neg_samples)
        neg_score = torch.bmm(neg_context_embeds, target_embeds.unsqueeze(2)).squeeze(2)
        neg_loss = -F.logsigmoid(-neg_score).sum(dim=1)

        loss = (pos_loss + neg_loss).mean()
        return loss

    def get_embeddings(self) -> torch.Tensor:
        """
        Returns learned target embeddings (or sum of target + context) for downstream vector operations.
        """
        embeds = self.target_embeddings.weight.data + self.context_embeddings.weight.data
        return embeds
